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
    const nodeParameters: Record<string, unknown> = parameters2toml(node.parameters, tomlSchemaOfNode)
    table[section] = Section(nodeParameters as any)
  }
  return table
}

function parameters2toml (parameters: IParameters, tomlSchema: TomlObjectSchema): any {
  const tomledParameters: Record<string, unknown> = {}
  Object.entries(parameters).forEach(([k, v]) => {
    const isArray = Array.isArray(v)
    const hasTomlSchema = k in tomlSchema
    const isIndexed = hasTomlSchema && tomlSchema[k].indexed === true
    const isSectioned = hasTomlSchema && tomlSchema[k].sectioned === true
    const isItemsSectioned = hasTomlSchema && tomlSchema[k].items?.sectioned === true
    const hasNestedTomlSchema = hasTomlSchema && isObject(tomlSchema[k].items?.properties)
    const nestedTomlSchema = hasNestedTomlSchema ? tomlSchema[k].items?.properties : {}
    if (isArray && isIndexed) {
      const isArrayFlatten = tomlSchema[k].items?.flatten === true
      const isArrayOfArrayFlatten = tomlSchema[k].items?.items?.flatten === true
      // indexed array of flattened objects
      if (isArrayFlatten) {
        v.forEach((d, i) => {
          Object.entries(d).forEach(([k2, v2]) => {
            tomledParameters[`${k}_${k2}_${i + 1}`] = v2
          })
        })
      } else if (isArrayOfArrayFlatten) {
        // indexed array of array of flattened objects
        v.forEach((v1: IParameters[], i) => {
          v1.forEach((v2, i2) => {
            Object.entries(v2).forEach(([k3, v3]) => {
              tomledParameters[`${k}_${k3}_${i + 1}_${i2 + 1}`] = v3
            })
          })
        })
      } else if (isItemsSectioned) {
        // indexed array of sectioned objects
        v.forEach((v1: IParameters, i) => {
          const d2 = parameters2toml(v1, nestedTomlSchema as TomlObjectSchema)
          tomledParameters[`${k}_${i + 1}`] = Section(d2)
        })
      } else {
        // indexed array of scalars
        v.forEach((d, i) => {
          tomledParameters[`${k}_${i + 1}`] = d
        })
      }
    } else if (isArray && isItemsSectioned) {
      // A value that is an array of objects will have each of its objects as a section
      tomledParameters[k] = v.map(d => {
        const d2 = parameters2toml(d, nestedTomlSchema as TomlObjectSchema)
        return Section(d2)
      })
    } else if (isObject(v) && isSectioned) {
      tomledParameters[k] = Section(v as any)
    } else {
      tomledParameters[k] = v
    }
  })
  return tomledParameters
}

export function workflow2tomltext (
  nodes: IWorkflowNode[],
  global: IParameters,
  tomlSchema4nodes: Record<string, TomlObjectSchema> = {},
  tomlSchema4global: TomlObjectSchema = {}
): string {
  const table = {
    ...nodes2tomltable(nodes, tomlSchema4nodes),
    ...parameters2toml(global, tomlSchema4global)
  }
  const text = stringify(table, {
    newline: '\n',
    indent: 2,
    integer: Number.MAX_SAFE_INTEGER
  })
  return text
}

function toml2parameters (tomledParameters: IParameters, tomlSchema: TomlObjectSchema): IParameters {
  const parameters: IParameters = {}
  Object.entries(tomledParameters).forEach(([k, v]) => {
    const [kFirstPart, ...kParts] = k.split('_')
    const hasTomlSchema = kFirstPart in tomlSchema
    const isIndexed = hasTomlSchema && tomlSchema[kFirstPart].indexed === true
    const kLastPart = kParts.pop() ?? 'NaN'
    const kLastIndex = parseInt(kLastPart) - 1
    const lastPartIsIndex = !isNaN(kLastIndex)
    const isArrayFlatten = tomlSchema[kFirstPart]?.items?.flatten === true
    const isArrayOfArrayFlatten = tomlSchema[kFirstPart]?.items?.items?.flatten === true
    const isMultiPartIndexed = kParts.length > 0 && isIndexed && lastPartIsIndex
    if (isIndexed && isObject(v)) {
      if (!(kFirstPart in parameters)) {
        parameters[kFirstPart] = []
      }
      const tomlSchemaOfK = tomlSchema[kFirstPart]?.items?.properties ?? {}
      const arrayOfK: IParameters = parameters[kFirstPart] as any
      arrayOfK[kLastIndex] = toml2parameters(v as IParameters, tomlSchemaOfK)
    } else if (kParts.length === 0 && isIndexed && lastPartIsIndex) {
      if (!(kFirstPart in parameters)) {
        parameters[kFirstPart] = []
      }
      const arrayOfK: IParameters = parameters[kFirstPart] as any
      arrayOfK[kLastIndex] = v
    } else if (isMultiPartIndexed && isArrayFlatten) {
      if (!(kFirstPart in parameters)) {
        parameters[kFirstPart] = []
      }
      const arrayOfK = parameters[kFirstPart] as any
      if (arrayOfK[kLastIndex] === undefined) {
        arrayOfK[kLastIndex] = {}
      }
      const k2 = kParts.join('_')
      arrayOfK[kLastIndex][k2] = v
    } else if (isMultiPartIndexed && isArrayOfArrayFlatten) {
      const kSecond2LastIndex = parseInt(kParts.pop() ?? 'NaN') - 1
      if (!(kFirstPart in parameters)) {
        parameters[kFirstPart] = []
      }
      const arrayOfK = parameters[kFirstPart] as any
      if (arrayOfK[kSecond2LastIndex] === undefined) {
        arrayOfK[kSecond2LastIndex] = []
      }
      if (arrayOfK[kSecond2LastIndex][kLastIndex] === undefined) {
        arrayOfK[kSecond2LastIndex][kLastIndex] = {}
      }
      const k2 = kParts.join('_')
      arrayOfK[kSecond2LastIndex][kLastIndex][k2] = v
    } else {
      parameters[k] = v
    }
  })
  return parameters
}

export function parseWorkflow (workflow: string, globalKeys: Set<string>, tomlSchema4global: TomlObjectSchema, tomSchema4nodes: Record<string, TomlObjectSchema>): IWorkflow {
  const table = parse(workflow, { bigint: false })
  const global: IParameters = {}
  const nodes: IWorkflowNode[] = []
  const sectionwithindex = /\.\d+$/
  Object.entries(table).forEach(([k, v]) => {
    const section = k.replace(sectionwithindex, '')
    const sectionParts = section.split('_') // TODO fragile as node name and first part of global key could overlap
    if (globalKeys.has(section) || globalKeys.has(sectionParts[0])) {
      global[k] = v
    } else {
      const tomlSchema4node = tomSchema4nodes[section] ?? {}
      nodes.push({
        id: section,
        parameters: toml2parameters(v as IParameters, tomlSchema4node)
      })
    }
  })
  // TODO validate nodes and global parameters against schemas in catalog
  return {
    nodes,
    global: toml2parameters(global, tomlSchema4global)
  }
}
