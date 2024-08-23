import { JSONSchema7 } from 'json-schema'
import { IParameters } from './types'

/**
 * Any parameter whose value is same as the default defined in the schema will be pruned and not returned.
 *
 * Unless parameter is required, then it will always be kept.
 */
export function pruneDefaults (parameters: IParameters, schema: JSONSchema7, reshapeArray = false): IParameters {
  const newParameters: IParameters = {}
  const required = new Set(schema.required)
  Object.entries(parameters).forEach(([k, v]) => {
    if (schema.properties !== undefined && k in schema.properties) {
      const schemaOfK = schema.properties[k] as JSONSchema7
      if (required.has(k)) {
        newParameters[k] = v
      } else if (v === schemaOfK.default || v === undefined) {
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
          const schemaOfItemAsObject: JSONSchema7 = {
            type: 'object',
            properties: {
              a: schemaOfItem
            }
          }
          const prunedV = v.map(v2 => {
            const pruned = pruneDefaults({ a: v2 }, schemaOfItemAsObject)
            // If item is type=object then the injected a key can also be pruned
            if (!('a' in pruned)) {
              if (reshapeArray) {
                return undefined
              }
              if (schemaOfItem.type === 'object') {
                return {}
              } else if (schemaOfItem.type === 'array') {
                return []
              } else {
                return v2
              }
            }
            // Keep original value when array item is completely default
            // this will keep the array the same length and not move items
            // unless reshapeArray=true then skip item
            return pruned.a === undefined && !reshapeArray ? v2 : pruned.a
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
    } else {
      newParameters[k] = v
    }
  })
  return pruneThenElses(newParameters, schema)
}

function pruneThenElses (parameters: IParameters, schema: JSONSchema7): IParameters {
  if (!(schema.if !== undefined && typeof schema.if !== 'boolean' && schema.if !== undefined && schema.if.properties !== undefined)) {
    // no if then bail out
    return parameters
  }

  const condition = Object.entries(schema.if.properties).every(
    ([k, sv]) => typeof sv === 'object' && sv.const !== undefined && sv.const === parameters[k]
  )
  if (condition) {
    // Remove else parameters
    if (schema.else !== undefined && typeof schema.else !== 'boolean' && schema.else !== undefined && schema.else.properties !== undefined) {
      const elsePropnames = Object.keys(schema.else.properties)
      for (const k of elsePropnames) {
        /* eslint-disable @typescript-eslint/no-dynamic-delete */
        delete parameters[k]
        /* eslint-enable @typescript-eslint/no-dynamic-delete */
      }
    }
    // Remove then parameters that are same as default
    if (schema.then !== undefined && typeof schema.then !== 'boolean' && schema.then !== undefined && schema.then.properties !== undefined) {
      const thenPropnames = Object.keys(schema.then.properties)
      for (const k of thenPropnames) {
        const p = schema.then.properties[k]
        if (typeof p === 'object' && p.default === parameters[k]) {
          /* eslint-disable @typescript-eslint/no-dynamic-delete */
          delete parameters[k]
          /* eslint-enable @typescript-eslint/no-dynamic-delete */
        }
      }
    }
  } else {
    // Remove then parameters
    if (schema.then !== undefined && typeof schema.then !== 'boolean' && schema.then !== undefined && schema.then.properties !== undefined) {
      const thenPropnames = Object.keys(schema.then.properties)
      for (const k of thenPropnames) {
        /* eslint-disable @typescript-eslint/no-dynamic-delete */
        delete parameters[k]
        /* eslint-enable @typescript-eslint/no-dynamic-delete */
      }
    }
    // Remove else parameters that are same as default
    if (schema.else !== undefined && typeof schema.else !== 'boolean' && schema.else !== undefined && schema.else.properties !== undefined) {
      const elsePropnames = Object.keys(schema.else.properties)
      for (const k of elsePropnames) {
        const p = schema.else.properties[k]
        if (typeof p === 'object' && p.default === parameters[k]) {
          /* eslint-disable @typescript-eslint/no-dynamic-delete */
          delete parameters[k]
          /* eslint-enable @typescript-eslint/no-dynamic-delete */
        }
      }
    }
  }

  return parameters
}
