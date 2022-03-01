import { JSONSchema7 } from 'json-schema'
import { IParameters } from './types'

/**
 * Any parameter whose value is same as the default defined in the schema will be pruned and not returned.
 */
export function pruneDefaults (parameters: IParameters, schema: JSONSchema7): IParameters {
  const newParameters: IParameters = {}
  Object.entries(parameters).forEach(([k, v]) => {
    if (schema.properties !== undefined && k in schema.properties) {
      const schemaOfK = schema.properties[k] as JSONSchema7
      if (v === schemaOfK.default) {
        // skip it
      } else if (schemaOfK.type === 'object') {
        const prunedV = pruneDefaults(v as IParameters, schemaOfK)
        if (Object.keys(prunedV).length > 0) {
          newParameters[k] = prunedV
        }
      } else if (schemaOfK.type === 'array' && Array.isArray(v)) {
        if (Array.isArray(schemaOfK.default) && schemaOfK.default.length === 0 && v.length === 0) {
          // if default=[] and v=[] then skip it
        } else if ('items' in schemaOfK) {
          const schemaOfItem = schemaOfK.items as JSONSchema7
          const prunedV = v.map(v2 => {
            const schemaOfItemAsObject: JSONSchema7 = {
              type: 'object',
              properties: {
                a: schemaOfItem
              }
            }
            return pruneDefaults({ a: v2 }, schemaOfItemAsObject).a
          }).filter(v2 => v2 !== undefined)
          if (prunedV.length > 0) {
            newParameters[k] = prunedV
          }
        }
        // TODO handle defaults in prefixItems, see https://json-schema.org/understanding-json-schema/reference/array.html#id7
        // but do not have catalog which uses tuples yet, so can delay it
      } else {
        newParameters[k] = v
      }
    }
  })
  return newParameters
}
