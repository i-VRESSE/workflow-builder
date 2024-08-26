import { JSONSchema7 } from 'json-schema'
import { moleculeFormats } from '@i-vresse/wb-form'
import { dataURL2content } from '../dataurls'
import { JSONSchema7WithMaxItemsFrom } from '../resolveMaxItemsFrom'
import { IFiles, IParameters } from '../types'
import { MoleculeInfo, parsePDB } from './parse'
import { UiSchema, utils } from '@rjsf/core'

// save in memory parsed molecule info
interface parsedMoleculeInfoProps {
  [key: string]: Omit<MoleculeInfo, 'path'>
}
const parsedMoleculeInfo: parsedMoleculeInfoProps = {}

export function parseMolecules (
  globalParameters: IParameters,
  globalSchema: JSONSchema7,
  files: IFiles
): [MoleculeInfo[], string | undefined] {
  if (globalSchema.properties === undefined) {
    return [[], undefined]
  }

  // find prop which has format:moleculefilepaths
  const moleculesPropNameAndSchema = Object.entries(
    globalSchema.properties
  ).find(
    ([k, v]) => typeof v !== 'boolean' && v.format === 'moleculefilepaths'
  )
  if (moleculesPropNameAndSchema === undefined) {
    return [[], undefined]
  }
  // not finding moleculefilepaths in then and else blocks as moleculefilepaths only supported in global schema properties

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
  const moleculeFiles = moleculeFilePaths
    // ignore undefined/null entries (invalid entries)
    .filter(file => {
      // check on undefined value in array incl. string value
      if (typeof file === 'undefined') return false
      // check for null value
      return file !== null
    })
    .map((p) => files[p])

  // parse file
  const moleculeInfos = moleculeFiles.map((f, i) => {
    // debugger
    // check if already parsed
    const path = moleculeFilePaths[i]
    if (Object.hasOwn(parsedMoleculeInfo, path)) {
      // console.log("from memory...",path)
      return {
        ...parsedMoleculeInfo[path],
        path
      }
    }
    // else parse the info
    const body = dataURL2content(f)
    const info = parsePDB(body)
    // save info in memory
    parsedMoleculeInfo[path] = { ...info }
    // return new info from memory
    return {
      ...parsedMoleculeInfo[path],
      path
    }
  })

  return [moleculeInfos, moleculesPropName]
}

function walkSchemaForMoleculeFormats (
  schema: JSONSchema7,
  moleculeInfos: MoleculeInfo[],
  moleculesPropName: string
): JSONSchema7 {
  const newSchema = { ...schema }
  if (newSchema.properties === undefined) {
    // schema need to be of type:object
    return newSchema
  }
  const entries = Object.entries(newSchema.properties).map(([k, v]) => {
    const s = v as JSONSchema7WithMaxItemsFrom
    const isArrayWithItems = s.type === 'array' && 'items' in s
    const isObjectWitAdditionalProps =
      s.type === 'object' &&
      typeof s.additionalProperties === 'object' &&
      !('properties' in s)
    if (isArrayWithItems && s.maxItemsFrom === moleculesPropName) {
      const s2 = s.items
      if (
        s2 !== undefined &&
        typeof s2 !== 'boolean' &&
        !Array.isArray(s2) &&
        s2.type === 'array' &&
        'items' in s2
      ) {
        const s3 = s2.items
        if (
          s3 !== undefined &&
          typeof s3 !== 'boolean' &&
          !Array.isArray(s3) &&
          s3.type === 'object' &&
          'properties' in s3
        ) {
          const s4 = s3.properties
          if (
            s4 !== undefined &&
            Object.values(s4).some(
              (p) =>
                typeof p !== 'boolean' &&
                !Array.isArray(p) &&
                'format' in p &&
                p.format !== undefined &&
                moleculeFormats.has(p.format)
            )
          ) {
            // Found array>array>object>scalar[format=moleculeformat]
            const items = moleculeInfos.map((molinfo) => {
              const properties = Object.fromEntries(
                Object.entries(s4).map(([pk, pv]) => {
                  if (
                    typeof pv !== 'boolean' &&
                    !Array.isArray(pv) &&
                    'format' in pv
                  ) {
                    if (pv.format === 'chain' && molinfo.chains.length > 0) {
                      const npv = { ...pv, enum: molinfo.chains }
                      return [pk, npv]
                    }
                    if (
                      pv.format === 'residue' &&
                      molinfo.residueSequenceNumbers.length > 0
                    ) {
                      const npv = {
                        ...pv,
                        enum: molinfo.residueSequenceNumbers
                      }
                      return [pk, npv]
                    }
                  }
                  return [pk, pv]
                })
              )
              const items2 = { ...s3, properties }
              return { ...s2, items: items2 }
            })
            return [
              k,
              {
                ...s,
                items
              }
            ]
          }
        }
      } else if (
        s2 !== undefined &&
        typeof s2 !== 'boolean' &&
        !Array.isArray(s2) &&
        s2.type === 'object' &&
        'properties' in s2 &&
        s2.properties !== undefined
      ) {
        const s3 = s2.properties
        const hasPropWithArrayofScalarWithMoleculeFormat = Object.values(
          s3
        ).some(
          (p) =>
            typeof p !== 'boolean' &&
            !Array.isArray(p) &&
            p.type === 'array' &&
            'items' in p &&
            !Array.isArray(p.items) &&
            p.items !== undefined &&
            typeof p.items !== 'boolean' &&
            'format' in p.items &&
            p.items.format !== undefined &&
            moleculeFormats.has(p.items.format)
        )
        if (hasPropWithArrayofScalarWithMoleculeFormat) {
          // Found array>object>array>scalar[format=moleculeformat]
          const items = moleculeInfos.map((molinfo) => {
            const properties = Object.fromEntries(
              Object.entries(s3).map(([pk, pv]) => {
                // TODO remove duplicate condition, if condition is same as condition on line 93-95,
                // tried f(): boolean, but got pv.items type too broad error
                if (
                  typeof pv !== 'boolean' &&
                  !Array.isArray(pv) &&
                  pv.type === 'array' &&
                  'items' in pv &&
                  !Array.isArray(pv.items) &&
                  pv.items !== undefined &&
                  typeof pv.items !== 'boolean' &&
                  'format' in pv.items &&
                  pv.items.format !== undefined &&
                  moleculeFormats.has(pv.items.format)
                ) {
                  if (pv.items.format === 'chain' && molinfo.chains.length > 0) {
                    return [
                      pk,
                      { ...pv, items: { ...pv.items, enum: molinfo.chains } }
                    ]
                  }
                  if (pv.items.format === 'residue' &&
                  molinfo.residueSequenceNumbers.length > 0
                  ) {
                    return [
                      pk,
                      {
                        ...pv,
                        items: {
                          ...pv.items,
                          enum: molinfo.residueSequenceNumbers
                        }
                      }
                    ]
                  }
                }
                return [pk, pv]
              })
            )
            return {
              ...s2,
              properties
            }
          })
          return [k, { ...s, items }]
        }
      }
    } else if (
      isObjectWitAdditionalProps &&
      s.maxPropertiesFrom === moleculesPropName
    ) {
      // TODO implement
      const newObjectSchema = v
      return [k, newObjectSchema]
    } else if (isArrayWithItems && typeof s.items === 'object' && !Array.isArray(s.items) && s.items.type === 'object') {
      // {type:array, items:{type:object, properties:{x:{type:string, format:chain}}}}
      const newObjectSchema = walkSchemaForMoleculeFormats(
        s.items,
        moleculeInfos,
        moleculesPropName
      )
      return [k, { ...s, items: newObjectSchema }]
    } else if (isArrayWithItems && typeof s.items === 'object' && !Array.isArray(s.items) && s.items.type === 'string') {
      // {type:array, items:{type:string, format:chain}}
      const newObjectSchema = walkSchemaForMoleculeFormats(
        {
          type: 'object',
          properties: {
            xxx: s.items
          }
        },
        moleculeInfos,
        moleculesPropName
      )
      if (!(newObjectSchema.properties !== undefined)) {
        throw new Error('Unreachable code')
      }
      return [k, { ...s, items: newObjectSchema.properties.xxx }]
    } else if (s.type === 'string' && s.format === 'chain' && moleculeInfos.every((m) => m.error === undefined)) {
      // Only set if all molecules have been parsed successfully
      const chains = [...new Set(moleculeInfos.flatMap((m) => m.chains))]
      const newSchema = { ...s, enum: chains }
      return [k, newSchema]
    } else if (s.type === 'object') {
      const newObjectSchema = walkSchemaForMoleculeFormats(
        s,
        moleculeInfos,
        moleculesPropName
      )
      return [k, newObjectSchema]
    }
    return [k, v]
  })
  // not finding molecule formats in then and else blocks as if block only supported in global schema
  newSchema.properties = Object.fromEntries(entries)
  return newSchema
}

export function addMoleculeValidation (
  schema: JSONSchema7,
  moleculeInfos: MoleculeInfo[],
  moleculesPropName: string | undefined
): JSONSchema7 {
  if (moleculesPropName !== undefined) {
    return walkSchemaForMoleculeFormats(
      schema,
      moleculeInfos,
      moleculesPropName
    )
  }
  return schema
}

function walkUiSchemaForMoleculeFormats (
  schema: JSONSchema7,
  uiSchema: UiSchema,
  moleculeInfos: MoleculeInfo[],
  moleculesPropName: string
): UiSchema {
  if (schema.properties === undefined) {
    // schema need to be of type:object
    return uiSchema
  }
  const moleculepaths = moleculeInfos.map((m) => m.path)
  const entries = Object.entries(uiSchema).map(([k, v]) => {
    if (schema.properties !== undefined && k in schema.properties) {
      const s = schema.properties[k] as JSONSchema7WithMaxItemsFrom

      const uiOptions = utils.getUiOptions(v)
      const isIndexable =
        uiOptions !== undefined &&
        'indexable' in uiOptions &&
        uiOptions.indexable === true
      if (isIndexable) {
        if ('maxItemsFrom' in s && s.maxItemsFrom === moleculesPropName) {
          const { 'ui:indexable': _overwritten, ...newV } = v
          return [
            k,
            {
              ...newV,
              'ui:options': {
                ...uiOptions,
                indexable: moleculepaths
              }
            }
          ]
        }
      }

      if (s.type === 'object') {
        const newUiSchema = walkUiSchemaForMoleculeFormats(
          s,
          v,
          moleculeInfos,
          moleculesPropName
        )
        return [k, newUiSchema]
      }
    }

    return [k, v]
  })
  return Object.fromEntries(entries)
}

/**
 * If in uiSchema a prop has `'ui:indexable':true` or `'ui:options':{indexable:true}`
 * and that prop in schema has maxItemsFrom===moleculesPropName then
 * set `ui:options':{indexable}` to paths of molecules.
 */
export function addMoleculeUi (
  uiSchema: UiSchema,
  schema: JSONSchema7,
  moleculeInfos: MoleculeInfo[],
  moleculesPropName: string | undefined
): UiSchema {
  if (moleculesPropName !== undefined) {
    return walkUiSchemaForMoleculeFormats(
      schema,
      uiSchema,
      moleculeInfos,
      moleculesPropName
    )
  }
  return uiSchema
}
