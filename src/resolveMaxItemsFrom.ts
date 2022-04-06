import { KeywordCxt, KeywordDefinition } from 'ajv'
import { JSONSchema7 } from 'json-schema'
import { IParameters } from './types'

export interface JSONSchema7WithMaxItemsFrom extends JSONSchema7 {
  maxItemsFrom?: string
}

export function resolveMaxItemsFrom (formSchema: JSONSchema7WithMaxItemsFrom, globalParameters: IParameters): JSONSchema7 | undefined {
  const newFormSchema = { ...formSchema }
  if (newFormSchema.properties === undefined) {
    return newFormSchema
  }
  const entries = Object.entries(newFormSchema.properties)
    .map(([k, v]) => {
      let s = v as JSONSchema7WithMaxItemsFrom
      if ('maxItemsFrom' in s && s.maxItemsFrom !== undefined) {
        const parentName = s.maxItemsFrom
        const parentValue = globalParameters[parentName]
        if (Array.isArray(parentValue)) {
          const parentLength = parentValue.length
          // Set child parameter schema to have same maxItems as global parent parameter value
          s = { ...s, maxItems: parentLength }
        }
      }
      if (s.type === 'object') {
        // formSchema can be grouped which means
        // the outer object is the group container and inner object could have `maxItemsFrom`
        // so need to recurse over objects of objects
        const nestedSchema = resolveMaxItemsFrom(s, globalParameters)
        if (nestedSchema !== undefined) {
          s = { ...s, properties: nestedSchema.properties }
        }
      }
      return [k, s]
    })
  newFormSchema.properties = Object.fromEntries(entries)
  return newFormSchema
}

/**
 * Keyword that can be added to ajv instance with addKeyword()
 * to make it aware of `maxItemsFrom` keyword in JSON schemas.
 */
export const ajvKeyword: KeywordDefinition = {
  keyword: 'maxItemsFrom',
  type: 'array',
  schemaType: 'string',
  code (cxt: KeywordCxt) {
    // Unable to validate because needs data from outside, so always OK
    cxt.ok(true)
  }
}
