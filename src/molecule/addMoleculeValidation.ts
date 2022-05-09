import { JSONSchema7 } from 'json-schema'
import { dataURL2content } from '../dataurls'
import { JSONSchema7WithMaxItemsFrom } from '../resolveMaxItemsFrom'
import { IFiles, IParameters } from '../types'
import { moleculeFormats } from './formats'
import { MoleculeInfo, parsePDB } from './parse'

// TODO can be quite expensive to parse big molecules, should try to use memoization
async function parseMolecules (globalParameters: IParameters, globalSchema: JSONSchema7, files: IFiles): Promise<[MoleculeInfo[], string | undefined]> {
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
  // TODO check whether files are actually PDB files using uiSchema.molecules..items.ui:options.accept: .pdb
  const moleculeFiles = moleculeFilePaths.map(p => files[p])
  // parse file
  const moleculeInfos = await Promise.all(moleculeFiles.map(async f => {
    const body = dataURL2content(f)
    return await parsePDB(body)
  }))
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
      if (isArrayWithItems && s.maxItemsFrom === moleculesPropName) {
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
                    if (pv.format === 'chain' && molinfo.chains.length > 0) {
                      const npv = { ...pv, enum: molinfo.chains }
                      return [pk, npv]
                    }
                    if (pv.format === 'residue' && molinfo.residueSequenceNumbers.length > 0) {
                      const npv = { ...pv, enum: molinfo.residueSequenceNumbers }
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
        } else if (
          s2 !== undefined && typeof s2 !== 'boolean' && !Array.isArray(s2) &&
          s2.type === 'object' && 'properties' in s2 && s2.properties !== undefined
        ) {
          const s3 = s2.properties
          const hasPropWithArrayofScalarWithMoleculeFormat = Object.values(s3).some(p =>
            typeof p !== 'boolean' && !Array.isArray(p) && p.type === 'array' &&
            'items' in p && !Array.isArray(p.items) && p.items !== undefined && typeof p.items !== 'boolean' &&
            'format' in p.items && p.items.format !== undefined && moleculeFormats.has(p.items.format)
          )
          if (hasPropWithArrayofScalarWithMoleculeFormat) {
            // Found array>object>array>scalar[format=moleculeformat]
            const items = moleculeInfos.map((molinfo) => {
              const properties = Object.fromEntries(Object.entries(s3).map(([pk, pv]) => {
                // TODO remove duplicate condition, if condition is same as condition on line 93-95,
                // tried f(): boolean, but got pv.items type too broad error
                if (typeof pv !== 'boolean' && !Array.isArray(pv) && pv.type === 'array' &&
                'items' in pv && !Array.isArray(pv.items) && pv.items !== undefined && typeof pv.items !== 'boolean' &&
                'format' in pv.items && pv.items.format !== undefined && moleculeFormats.has(pv.items.format)) {
                  if (pv.items.format === 'chain') {
                    return [pk, { ...pv, items: { ...pv.items, enum: molinfo.chains } }]
                  }
                  if (pv.items.format === 'residue') {
                    return [pk, { ...pv, items: { ...pv.items, enum: molinfo.residueSequenceNumbers } }]
                  }
                }
                return [pk, pv]
              }))
              return {
                ...s2,
                properties
              }
            })
            return [k, { ...s, items }]
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

export async function addMoleculeValidation (schema: JSONSchema7, globalParameters: IParameters, globalSchema: JSONSchema7, files: IFiles): Promise<JSONSchema7> {
  const [moleculeInfos, moleculesPropName] = await parseMolecules(globalParameters, globalSchema, files)
  if (moleculesPropName !== undefined) {
    return walkSchemaForMoleculeFormats(schema, moleculeInfos, moleculesPropName)
  }
  return schema
}
