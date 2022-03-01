import { Section, stringify, parse } from '@ltd/j-toml'
import { isObject } from './utils/isObject'
import { IWorkflowNode, IParameters, IWorkflow, TomlObjectSchema } from './types'

function nodes2tomltable (nodes: IWorkflowNode[], tomlSchema4nodes: Record<string, TomlObjectSchema> = {}): Record<string, unknown> {
  const table: Record<string, unknown> = {}
  const track: Record<string, number> = {}
  for (const node of nodes) {
    if (!(node.id in track)) {
      track[node.id] = 0
    }
    track[node.id]++
    const tomlSchemaOfNode = node.id in tomlSchema4nodes ? tomlSchema4nodes[node.id] : {}
    const section =
      track[node.id] > 1 ? `${node.id}.${track[node.id]}` : node.id
    const nodeParameters: Record<string, unknown> = {}
    // TODO make recursive so `items.input.items.hisd: nesting` is also applied
    Object.entries(node.parameters).forEach(([k, v]) => {
      if (Array.isArray(v) && k in tomlSchemaOfNode && 'indexed' in tomlSchemaOfNode[k] && tomlSchemaOfNode[k].indexed === true) {
        // indexed array of flattened objects
        if (tomlSchemaOfNode[k].items?.flatten === true) {
          v.forEach((d, i) => {
            Object.entries(d).forEach(([k2, v2]) => {
              nodeParameters[`${k}_${k2}_${i + 1}`] = v2
            })
          })
          // indexed array of array of flattened objects
        } else if (tomlSchemaOfNode[k].items?.indexed === true && tomlSchemaOfNode[k].items?.items?.flatten === true) {
          v.forEach((v1: IParameters[], i) => {
            v1.forEach((v2, i2) => {
              Object.entries(v2).forEach(([k3, v3]) => {
                nodeParameters[`${k}_${k3}_${i + 1}_${i2 + 1}`] = v3
              })
            })
          })
        } else {
          // indexed array of scalars
          v.forEach((d, i) => {
            nodeParameters[`${k}_${i + 1}`] = d
          })
        }
      } else if (Array.isArray(v) && v.length > 0 && isObject(v[0])) {
        // A value that is an array of objects will have each of its objects as a section
        nodeParameters[k] = v.map(d => Section(d))
      } else if (isObject(v)) {
        nodeParameters[k] = Section(v as any)
      } else {
        nodeParameters[k] = v
      }
    })
    table[section] = Section(nodeParameters as any)
  }
  return table
}

export function workflow2tomltext (
  nodes: IWorkflowNode[],
  global: IParameters,
  tomlSchema4nodes: Record<string, TomlObjectSchema> = {},
  tomlSchema4global: TomlObjectSchema = {}
): string {
  const table = {
    ...nodes2tomltable(nodes, tomlSchema4nodes),
    ...global
  }
  const text = stringify(table as any, {
    newline: '\n',
    integer: Number.MAX_SAFE_INTEGER
  })
  return text
}

export function parseWorkflow (workflow: string, globalKeys: Set<string>): IWorkflow {
  const table = parse(workflow, { bigint: false })
  const global: IParameters = {}
  const nodes: IWorkflowNode[] = []
  const sectionwithindex = /\.\d+$/
  Object.entries(table).forEach(([k, v]) => {
    const section = k.replace(sectionwithindex, '')
    if (globalKeys.has(section)) {
      global[k] = v
    } else {
      nodes.push({
        id: section,
        parameters: v as IParameters
      })
    }
  })
  // TODO validate nodes and global parameters against schemas in catalog
  return { nodes, global }
}
