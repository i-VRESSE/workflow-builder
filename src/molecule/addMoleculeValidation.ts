import { JSONSchema7 } from 'json-schema'
import { dataURL2content } from '../dataurls'
import { JSONSchema7WithMaxItemsFrom } from '../resolveMaxItemsFrom'
import { IFiles, IParameters } from '../types'
import { MoleculeInfo, parsePDB } from './parse'

// TODO can be quite expensive to parse big molecules, should try to use memoization
function parseMolecules (globalParameters: IParameters, globalSchema: JSONSchema7, files: IFiles): MoleculeInfo[] {
  if (globalSchema.properties === undefined) {
    return []
  }
  // find prop which has format:moleculefilepaths
  const moleculesPropNameAndSchema = Object.entries(globalSchema.properties)
    .find(([k, v]) => typeof v !== 'boolean' && v.format === 'moleculefilepaths')
  if (moleculesPropNameAndSchema === undefined) {
    return []
  }
  // find molecule file paths that belongs to this array item
  const moleculesPropName = moleculesPropNameAndSchema[0]
  if (!(moleculesPropName in globalParameters)) {
    return []
  }
  const moleculeFilePaths = globalParameters[moleculesPropName]
  if (!Array.isArray(moleculeFilePaths)) {
    return []
  }
  // find file of molecule path
  const moleculeFiles = moleculeFilePaths.map(p => files[p])
  // parse file
  const moleculeInfos = moleculeFiles.map(f => {
    const body = dataURL2content(f)
    return parsePDB(body)
  })
  return moleculeInfos
}

function walkSchemaForMoleculeFormats (schema: JSONSchema7, moleculeInfos: MoleculeInfo[]): JSONSchema7 {
  const newSchema = { ...schema }
  if (newSchema.properties === undefined) {
    return newSchema
  }
  const entries = Object.entries(newSchema.properties)
    .map(([k, v]) => {
      const s = v as JSONSchema7WithMaxItemsFrom
      if (s.type === 'array' && 'items' in s && s.items !== undefined && !Array.isArray(s.items)) {
        // Method expects schema with type:object so wrap items in object
        const arraySchema: JSONSchema7 = {
          type: 'object',
          properties: {
            a: s.items
          }
        }
        const newArraySchema = walkSchemaForMoleculeFormats(arraySchema, moleculeInfos)
        if (newArraySchema.properties !== undefined) {
          return [k, { ...s, items: newArraySchema.properties.a }]
        }
      } else if (s.type === 'object') {
        const newObjectSchema = walkSchemaForMoleculeFormats(s, moleculeInfos)
        return [k, newObjectSchema]
      }
      if ('format' in s && s.format === 'chain') {
        // TODO find molecule file name that belongs to this array item
        // TODO find file of molecule
        // TODO parse file
        const molinfo: MoleculeInfo = moleculeInfos[0]
        const newChainSchema = { ...s, enum: molinfo.chains }
        return [k, newChainSchema]
      }
      return [k, v]
    })
  newSchema.properties = Object.fromEntries(entries)
  return newSchema
}

export function addMoleculeValidation (schema: JSONSchema7, globalParameters: IParameters, globalSchema: JSONSchema7, files: IFiles): JSONSchema7 {
  const moleculeInfos = parseMolecules(globalParameters, globalSchema, files)
  return walkSchemaForMoleculeFormats(schema, moleculeInfos)
}
