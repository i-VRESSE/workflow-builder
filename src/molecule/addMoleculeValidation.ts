import { JSONSchema7 } from 'json-schema'
import { dataURL2content } from '../dataurls'
import { JSONSchema7WithMaxItemsFrom } from '../resolveMaxItemsFrom'
import { IFiles, IParameters } from '../types'
import { moleculeFormats } from './formats'
import { MoleculeInfo, parsePDB } from './parse'

// TODO can be quite expensive to parse big molecules, should try to use memoization
function parseMolecules (globalParameters: IParameters, globalSchema: JSONSchema7, files: IFiles): [MoleculeInfo[], string | undefined] {
  if (globalSchema.properties === undefined) {
    return [[], undefined]
  }
  // find prop which has format:moleculefilepaths
  const moleculesPropNameAndSchema = Object.entries(globalSchema.properties)
    .find(([k, v]) => typeof v !== 'boolean' && v.format === 'moleculefilepaths')
  if (moleculesPropNameAndSchema === undefined) {
    return [[], undefined]
  }
  // find molecule file paths that belongs to this array item
  const moleculesPropName = moleculesPropNameAndSchema[0]
  if (!(moleculesPropName in globalParameters)) {
    return [[], undefined]
  }
  const moleculeFilePaths = globalParameters[moleculesPropName]
  if (!Array.isArray(moleculeFilePaths)) {
    return [[], undefined]
  }
  // find file of molecule path
  const moleculeFiles = moleculeFilePaths.map(p => files[p])
  // parse file
  const moleculeInfos = moleculeFiles.map(f => {
    const body = dataURL2content(f)
    return parsePDB(body)
  })
  return [moleculeInfos, moleculesPropName]
}

function walkSchemaForMoleculeFormats (schema: JSONSchema7, moleculeInfos: MoleculeInfo[], moleculesPropName: string): JSONSchema7 {
  const newSchema = { ...schema }
  if (newSchema.properties === undefined) {
    // schema need to be of type:object
    return newSchema
  }
  const entries = Object.entries(newSchema.properties)
    .map(([k, v]) => {
      const s = v as JSONSchema7WithMaxItemsFrom
      const isArrayWithItems = s.type === 'array' && 'items' in s
      if (isArrayWithItems) {
        const s2 = s.items
        if (
          s2 !== undefined && typeof s2 !== 'boolean' && !Array.isArray(s2) &&
          s2.type === 'array' && 'items' in s2) {
          const s3 = s2.items
          if (
            s3 !== undefined && typeof s3 !== 'boolean' && !Array.isArray(s3) &&
            s3.type === 'object' && 'properties' in s3
          ) {
            const s4 = s3.properties
            if (s4 !== undefined && Object.values(s4).some(
              p => typeof p !== 'boolean' && !Array.isArray(p) && 'format' in p && p.format !== undefined && moleculeFormats.has(p.format)
            )) {
              // Found array>array>object>scalar[format=moleculeformat]
              const items = moleculeInfos.map((molinfo) => {
                const properties = Object.fromEntries(Object.entries(s4).map(([pk, pv]) => {
                  if (typeof pv !== 'boolean' && !Array.isArray(pv) && 'format' in pv) {
                    if (pv.format === 'chain') {
                      const npv = { ...pv, enum: molinfo.chains }
                      return [pk, npv]
                    }
                  }
                  return [pk, pv]
                }))
                const items2 = { ...s3, properties }
                return { ...s2, items: items2 }
              })
              return [k, {
                ...s,
                items
              }]
            }
          }
        }
      } else if (s.type === 'object') {
        const newObjectSchema = walkSchemaForMoleculeFormats(s, moleculeInfos, moleculesPropName)
        return [k, newObjectSchema]
      }
      return [k, v]
    })
  newSchema.properties = Object.fromEntries(entries)
  return newSchema
}

export function addMoleculeValidation (schema: JSONSchema7, globalParameters: IParameters, globalSchema: JSONSchema7, files: IFiles): JSONSchema7 {
  const [moleculeInfos, moleculesPropName] = parseMolecules(globalParameters, globalSchema, files)
  if (moleculesPropName !== undefined) {
    return walkSchemaForMoleculeFormats(schema, moleculeInfos, moleculesPropName)
  }
  return schema
}
