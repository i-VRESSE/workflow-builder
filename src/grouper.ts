import { UiSchema } from '@rjsf/core'
import { ICatalog, IParameters } from './types'
import { JSONSchema7 } from 'json-schema'
import { isObject } from './utils/isObject'

export function groupSchema (schema: JSONSchema7, uiSchema: UiSchema): JSONSchema7 {
  const newSchema = JSON.parse(JSON.stringify(schema))

  Object.entries(uiSchema).forEach(([k, v]) => {
    // TODO recursivly, now only loops over first direct props
    if ('ui:group' in v) {
      const group = v['ui:group']
      if (!(group in newSchema.properties)) {
        newSchema.properties[group] = {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      }
      newSchema.properties[group].properties[k] = newSchema.properties[k]
      /* eslint-disable @typescript-eslint/no-dynamic-delete */
      delete newSchema.properties[k]
      /* eslint-enable @typescript-eslint/no-dynamic-delete */
    }
  })

  return newSchema
}

export function groupUiSchema (uiSchema: UiSchema): UiSchema {
  const newUiSchema: UiSchema = {}
  Object.entries(uiSchema).forEach(([k, v]) => {
    // TODO recursivly, now only loops over first direct props
    if ('ui:group' in v) {
      const group = v['ui:group']
      const newuiProp = { ...v } // Shallow copy
      /* eslint-disable @typescript-eslint/no-dynamic-delete */
      delete newuiProp['ui:group']
      /* eslint-enable @typescript-eslint/no-dynamic-delete */
      if (Object.keys(newuiProp).length > 0) {
        if (!(group in newUiSchema)) {
          newUiSchema[group] = {}
        }
        newUiSchema[group][k] = newuiProp
      }
    } else {
      newUiSchema[k] = v
    }
  })
  return newUiSchema
}

export function groupParameters (parameters: IParameters, uiSchema: UiSchema): IParameters {
  const newParameters: IParameters = {}

  Object.entries(parameters).forEach(([k, v]) => {
    if (k in uiSchema && 'ui:group' in uiSchema[k]) {
      const group = uiSchema[k]['ui:group']
      if (!(group in newParameters)) {
        newParameters[group] = {}
      }
      (newParameters[group] as IParameters)[k] = v
      /* eslint-disable @typescript-eslint/no-dynamic-delete */
      delete newParameters[k]
      /* eslint-enable @typescript-eslint/no-dynamic-delete */
    } else {
      newParameters[k] = v
    }
  })

  return newParameters
}

export function unGroupParameters (parameters: IParameters, uiSchema: UiSchema): IParameters {
  // TODO order return by first ungrouped params and then all previously grouped params
  const newParameters: IParameters = {}
  Object.entries(parameters).forEach(([k, v]) => {
    if (isObject(v)) {
      // TODO recursivly, now only loops over first direct props
      Object.entries(v as IParameters).forEach(([gk, gv]) => {
        if (gk in uiSchema && 'ui:group' in uiSchema[gk]) {
          newParameters[gk] = gv
        }
      })
    } else {
      newParameters[k] = v
    }
  })

  return newParameters
}

export function groupCatalog (catalog: ICatalog): ICatalog {
  const global = {
    ...catalog.global,
    formUiSchema: groupUiSchema(catalog.global.uiSchema),
    formSchema: groupSchema(catalog.global.schema, catalog.global.uiSchema)
  }
  const nodes = catalog.nodes.map(n => {
    return {
      ...n,
      formUiSchema: groupUiSchema(n.uiSchema),
      formSchema: groupSchema(n.schema, n.uiSchema)
    }
  })

  return {
    ...catalog,
    global,
    nodes
  }
}
