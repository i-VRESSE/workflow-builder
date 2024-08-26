import { Section, stringify, parse } from '@ltd/j-toml'
import { isObject } from './utils/isObject'
import { IWorkflowNode, IParameters, IWorkflow, TomlObjectSchema, ICatalog } from './types'
import { mergeHeader, splitHeader } from './dsv'
import { nanoid } from 'nanoid'
import { globalParameterKeys } from './catalog'

export interface TomlSchemas {
  nodes: Record<string, TomlObjectSchema>
  global: TomlObjectSchema
}

export function catalog2tomlSchemas (catalog: ICatalog): TomlSchemas {
  const nodes = Object.fromEntries(catalog.nodes.map(n => [n.id, n.tomlSchema !== undefined ? n.tomlSchema : {}]))
  const global = catalog.global.tomlSchema ?? {}
  return { nodes, global }
}

function nodes2tomltable (nodes: IWorkflowNode[], tomlSchema4nodes: Record<string, TomlObjectSchema> = {}): Record<string, unknown> {
  const table: Record<string, unknown> = {}
  const track: Record<string, number> = {}
  for (const node of nodes) {
    if (!(node.type in track)) {
      track[node.type] = 0
    }
    track[node.type]++
    const tomlSchemaOfNode = node.type in tomlSchema4nodes ? tomlSchema4nodes[node.type] : {}
    const section =
      track[node.type] > 1 ? `${node.type}.${track[node.type]}` : node.type
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
          tomledParameters[`${k}${i + 1}`] = Section(d2)
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
    } else if (isArray) {
      // debugger
      // clear array of undefined entries
      tomledParameters[k] = v.filter(item => item !== undefined)
    } else if (isObject(v) && isSectioned) {
      tomledParameters[k] = Section(v as any)
    } else if (isObject(v) && isIndexed) {
      Object.entries(v).forEach(([k2, v2]) => {
        const v3 = Array.isArray(v2) ? v2.filter(item => item !== undefined) : v2
        tomledParameters[`${k}_${k2}`] = v3
      })
    } else if (v !== undefined) {
      // avoid params with undefined value
      tomledParameters[k] = v
    }
  })
  return tomledParameters
}

export function workflow2tomltext (
  nodes: IWorkflowNode[],
  global: IParameters,
  tomlSchemas: TomlSchemas
): string {
  const table = {
    ...nodes2tomltable(nodes, tomlSchemas.nodes),
    ...parameters2toml(global, tomlSchemas.global)
  }
  const text = stringify(table, {
    newline: '\n',
    indent: 2,
    integer: Number.MAX_SAFE_INTEGER
  }).replaceAll(/\n\]\n/g, '\n]\n\n') // haddock3 requires newline after array
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
    const hasNumberedTrail = k.match(/^(.*)(\d+)$/)
    if (
      hasNumberedTrail !== null &&
      tomlSchema[hasNumberedTrail[1]]?.items?.sectioned === true &&
      hasNumberedTrail[1] in tomlSchema &&
      tomlSchema[hasNumberedTrail[1]].indexed === true
    ) {
      const unNumberedK = hasNumberedTrail[1]
      const kNumber = parseInt(hasNumberedTrail[2]) - 1
      if (!(unNumberedK in parameters)) {
        parameters[unNumberedK] = []
      }
      const tomlSchemaOfK = tomlSchema[unNumberedK]?.items?.properties ?? {}
      const arrayOfK: IParameters = parameters[unNumberedK] as any
      arrayOfK[kNumber] = toml2parameters(v as IParameters, tomlSchemaOfK)
    } else if (isIndexed && isObject(v)) {
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
    } else if (isIndexed && !lastPartIsIndex) {
      if (!(kFirstPart in parameters)) {
        parameters[kFirstPart] = {}
      }
      const arrayOfK: IParameters = parameters[kFirstPart] as any
      arrayOfK[kLastPart] = v
    } else {
      parameters[k] = v
    }
  })
  return parameters
}

export function parseWorkflow (workflow: string,
  catalog: ICatalog): IWorkflow {
  const table = tomlstring2table(workflow)
  return parseWorkflowFromTable(table, catalog)
}

export function tomlstring2table (workflow: string): ReturnType<typeof parse> {
  const deduppedWorkflow = dedupWorkflow(workflow)
  const table = parse(deduppedWorkflow, { bigint: false })
  return table
}

export function parseWorkflowByCatalogPieces (
  table: ReturnType<typeof parse>,
  globalKeys: Set<string>,
  tomlSchema4global: TomlObjectSchema,
  tomSchema4nodes: Record<string, TomlObjectSchema>
): IWorkflow {
  const global: IParameters = {}
  const nodes: IWorkflowNode[] = []
  const sectionwithindex = /\.?\d+$/
  Object.entries(table).forEach(([k, v]) => {
    const section = k.replace(sectionwithindex, '')
    const sectionParts = section.split('_') // TODO fragile as node name and first part of global key could overlap
    if (globalKeys.has(k) || globalKeys.has(section) || globalKeys.has(sectionParts[0])) {
      global[k] = v
    } else {
      const tomlSchema4node = tomSchema4nodes[section] ?? {}
      nodes.push({
        type: section, // aka node type
        parameters: toml2parameters(v as IParameters, tomlSchema4node),
        id: nanoid()
      })
    }
  })
  // TODO validate nodes and global parameters against schemas in catalog
  return {
    nodes,
    global: toml2parameters(global, tomlSchema4global)
  }
}

export function parseWorkflowFromTable (
  table: ReturnType<typeof parse>,
  catalog: ICatalog
): IWorkflow {
  const globalKeys = globalParameterKeys(catalog.global)
  const tomlSchema4global = catalog.global.tomlSchema ?? {}
  const tomSchema4nodes = Object.fromEntries(catalog.nodes.map(
    n => [n.id, n.tomlSchema !== undefined ? n.tomlSchema : {}])
  )
  return parseWorkflowByCatalogPieces(
    table,
    globalKeys,
    tomlSchema4global,
    tomSchema4nodes
  )
}

/**
 * Adds index to every repeated header
 */
function uniqueHeader (line: string, memory: Map<string, number>): string {
  const isHeader = /^\['?\w+.*\]$/
  if (!isHeader.test(line)) {
    return line
  }
  const header = line.slice(1, -1)
  let [nodeName, ...rest] = splitHeader(header)
  const hasDigit = nodeName.match(/^(\w+)\.\d+$/)
  if (hasDigit !== null) {
    nodeName = hasDigit[1]
  }
  if (nodeName !== '') {
    const canonicalHeader = [nodeName, ...rest].join('.')
    const index = memory.get(canonicalHeader)
    if (index !== undefined) {
      memory.set(canonicalHeader, index + 1)
      const newHeader = mergeHeader([`${nodeName}.${index}`, ...rest])
      return `[${newHeader}]`
    } else {
      memory.set(canonicalHeader, 1)
      return line
    }
  } else {
    return line
  }
}

/**
 * Replaces
 * ```toml
 * [somenode]
 * [somenode]
 * ```
 * with
 * ```toml
 * [somenode]
 * ['somenode.1']
 * ```
 */
export function dedupWorkflow (inp: string): string {
  const headers: Map<string, number> = new Map()
  return inp
    .replaceAll('\r\n', '\n')
    .replace('\r', '\n')
    .split('\n').map(
      (line) => uniqueHeader(line, headers)
    )
    .join('\n')
}
