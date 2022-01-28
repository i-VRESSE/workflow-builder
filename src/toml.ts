import { Section, stringify, parse } from '@ltd/j-toml'
import { IWorkflowNode, IParameters } from './types'

function isObject (o: unknown): boolean {
  return typeof o === 'object' &&
    Object.prototype.toString.call(o) === '[object Object]'
}

function nodes2tomltable (nodes: IWorkflowNode[]) {
  const table: Record<string, unknown> = {}
  const track: Record<string, number> = {}
  for (const node of nodes) {
    if (!(node.id in track)) {
      track[node.id] = 0
    }
    track[node.id]++
    const section =
      track[node.id] > 1 ? `${node.id}.${track[node.id]}` : node.id
    const nodeParameters: Record<string, unknown> = {}
    // TODO make recursive so `items.input.items.hisd: nesting` is also applied
    Object.entries(node.parameters).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length > 0 && isObject(v[0])) {
        // A value that is an array of objects will have each of its objects as a section
        nodeParameters[k] = v.map(d => Section(d))
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
  global: IParameters
) {
  const table = {
    ...nodes2tomltable(nodes),
    ...global
  }
  const text = stringify(table as any, {
    newline: '\n',
    integer: Number.MAX_SAFE_INTEGER
  })
  return text
}

export function parseWorkflow (workflow: string, globalKeys: Set<string>) {
  const table = parse(workflow, { bigint: false })
  const global: Record<string, unknown> = {}
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
