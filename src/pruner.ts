import { JSONSchema7 } from 'json-schema'
import { IParameters } from './types'

/**
 * Any parameter whose value is same as the default defined in the schema will be pruned and not returned.
 */
export function pruneDefaults (parameters: IParameters, schema: JSONSchema7, reshapeArray = false): IParameters {
  const newParameters: IParameters = {}
  Object.entries(parameters).forEach(([k, v]) => {
    if (schema.properties !== undefined && k in schema.properties) {
      const schemaOfK = schema.properties[k] as JSONSchema7
      if (v === schemaOfK.default || v === undefined) {
        // skip it
      } else if (schemaOfK.type === 'object') {
        const prunedV = pruneDefaults(v as IParameters, schemaOfK)
        if (Object.keys(prunedV).length > 0) {
          newParameters[k] = prunedV
        }
      } else if (Array.isArray(v)) {
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
            const pruned = pruneDefaults({ a: v2 }, schemaOfItemAsObject).a
            // Keep original value when array item is completely default
            // this will keep the array the same lenght and not move items
            return pruned === undefined && !reshapeArray ? v2 : pruned
          })
          if (reshapeArray) {
            const prunedV2 = prunedV.filter(d => d !== undefined)
            if (prunedV2.length > 0) {
              newParameters[k] = prunedV2
            }
          } else {
            newParameters[k] = prunedV
          }
        } else {
          // TODO handle defaults in prefixItems, see https://json-schema.org/understanding-json-schema/reference/array.html#id7
          // but do not have catalog which uses tuples yet, so can delay it
          newParameters[k] = v
        }
      } else {
        newParameters[k] = v
      }
    }
  })
  return newParameters
}
