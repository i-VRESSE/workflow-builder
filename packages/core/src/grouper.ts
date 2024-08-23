/**
 * The rendered form using the `GlobalForm` or `NodeForm` components
 * can have their parameters grouped.
 * Grouping can be done in the `uiSchema` property.
 *
 * There are 2 ways of grouping
 * 1. `"ui:field": "collapsible"`, rendered form and form data is grouped
 * 2. `"ui:group": "<group name>"`, rendered form is grouped, but form data is flat.
 *
 * The uiSchema configuration is documented at /docs/uiSchema.md .
 *
 * To methods below allow for the rendered form to be grouped and the form data to be flat.
 *
 * @packageDocumentation
 */
import { UiSchema } from '@rjsf/core'
import { ICatalog, IParameters } from './types'
import { JSONSchema7 } from 'json-schema'
import { isObject } from './utils/isObject'

function groupOfIfProp (schema: JSONSchema7, uiSchema: UiSchema): string | undefined {
  if (!(schema.if !== undefined &&
    typeof schema.if !== 'boolean' &&
    (schema.if.properties != null))) {
    return undefined
  }
  // TODO handle multiple props in schema.if
  const ifPropName = Object.keys(schema.if.properties)[0]
  if (ifPropName in uiSchema && 'ui:group' in uiSchema[ifPropName]) {
    return uiSchema[ifPropName]['ui:group']
  }
  return undefined
}

function groupSchemaCondition ({
  k,
  v,
  group,
  newSchema,
  uiSchema,
  newGroup
}: {
  k: string
  v: UiSchema
  group: string
  newSchema: JSONSchema7
  uiSchema: UiSchema
  newGroup: JSONSchema7
}): boolean {
  // TODO handle when if is in group but then/else is not
  // now treated as normal prop instead of conditional
  const elseInGroup =
    newSchema.else !== undefined &&
    typeof newSchema.else !== 'boolean' &&
    (newSchema.else.properties != null) &&
    k in newSchema.else.properties
  const thenInGroup =
    newSchema.then !== undefined &&
    typeof newSchema.then !== 'boolean' &&
    (newSchema.then.properties != null) &&
    k in newSchema.then.properties
  if (thenInGroup || elseInGroup) {
    const ifGroup = groupOfIfProp(newSchema, uiSchema)
    if (ifGroup !== group) {
      throw new Error(
        'Cannot have an if in one group and a then/else in another group'
      )
    }
    newGroup.if = newSchema.if
    newGroup.then = newSchema.then
    newGroup.else = newSchema.else
    /* eslint-disable @typescript-eslint/no-dynamic-delete */
    delete newSchema.if
    delete newSchema.then
    delete newSchema.else
    /* eslint-enable @typescript-eslint/no-dynamic-delete */
    return true
  }
  return false
}

/**
 * Create new JSON schema where properties marked with same `ui:group` are grouped together into an object.
 *
 * @param schema
 * @param uiSchema
 * @returns
 */
export function groupSchema (
  schema: JSONSchema7,
  uiSchema: UiSchema
): JSONSchema7 {
  const newSchema = structuredClone(schema)

  // Handle overlap between groups and direct prop names.
  const definedGroups = new Set(
    Object.values(uiSchema)
      .filter((v) => 'ui:group' in v)
      .map((v) => v['ui:group'])
  )
  const propsWithGroup = new Set(
    Object.keys(uiSchema).filter((k) => 'ui:group' in uiSchema[k])
  )
  const allProps = new Set(Object.keys(schema.properties ?? {}))
  const grouplessProps = new Set(
    [...allProps].filter((x) => !propsWithGroup.has(x))
  )
  const grouplessPropsWithSameNameAsGroup = new Set(
    [...grouplessProps].filter((x) => definedGroups.has(x))
  )
  // direct prop with same name as group throw error
  if (grouplessPropsWithSameNameAsGroup.size > 0) {
    const msg = Array.from(grouplessPropsWithSameNameAsGroup).join(', ')
    throw new Error(
      `Can not have group and un-grouped parameter with same name ${msg}`
    )
  }

  if (
    !('properties' in newSchema && typeof newSchema.properties === 'object')
  ) {
    return newSchema
  }

  // prop with group and same name as any group should be nested first
  const propsWithSameNameAsAnyGroup = new Set(
    Object.entries(uiSchema)
      .filter(([k, v]) => 'ui:group' in v && definedGroups.has(k))
      .map((d) => d[0])
  )
  for (const k of propsWithSameNameAsAnyGroup) {
    const prop = newSchema.properties[k]
    /* eslint-disable @typescript-eslint/no-dynamic-delete */
    delete newSchema.properties[k]
    /* eslint-enable @typescript-eslint/no-dynamic-delete */
    const group = uiSchema[k]['ui:group']
    newSchema.properties[group] = {
      type: 'object',
      properties: {
        [k]: prop
      },
      additionalProperties: false
    }
  }

  Object.entries(uiSchema).forEach(([k, v]) => {
    // TODO recursivly, now only loops over first direct props
    if ('ui:group' in v && !propsWithSameNameAsAnyGroup.has(k)) {
      const group = v['ui:group']
      if (
        !('properties' in newSchema && typeof newSchema.properties === 'object')
      ) {
        throw new Error('Schema must have properties')
      }
      if (!(group in newSchema.properties)) {
        newSchema.properties[group] = {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      }
      const newGroup = newSchema.properties[group]
      if (typeof newGroup === 'boolean' || newGroup.properties === undefined) {
        return
      }
      if (
        groupSchemaCondition({
          k,
          v,
          group,
          newSchema,
          uiSchema,
          newGroup
        })
      ) {
        // If k was a then or else prop then it is has been moved to the newGroup as if/then/else
        // no need to move it as property
        return
      }

      newGroup.properties[k] = newSchema.properties[k]
      // Remove k as it now is in the group
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
      const { 'ui:group': group, ...newUiProp } = v
      if (!(group in newUiSchema)) {
        if (group in uiSchema) {
          newUiSchema[group] = {
            'ui:field': 'collapsible',
            ...uiSchema[group]
          }
        } else {
          newUiSchema[group] = { 'ui:field': 'collapsible' }
        }
      }
      if (Object.keys(newUiProp).length > 0) {
        newUiSchema[group][k] = newUiProp
      }
    } else if (k in newUiSchema) {
      newUiSchema[k] = { ...newUiSchema[k], ...v }
    } else {
      newUiSchema[k] = v
    }
  })
  return newUiSchema
}

export function groupParameters (
  parameters: IParameters,
  uiSchema: UiSchema
): IParameters {
  const newParameters: IParameters = {}

  Object.entries(parameters).forEach(([k, v]) => {
    if (k in uiSchema && 'ui:group' in uiSchema[k]) {
      const group = uiSchema[k]['ui:group']
      if (!(group in newParameters)) {
        newParameters[group] = {}
      }
      (newParameters[group] as IParameters)[k] = v
    } else {
      newParameters[k] = v
    }
  })

  return newParameters
}

export function unGroupParameters (
  parameters: IParameters,
  uiSchema: UiSchema
): IParameters {
  // TODO order return by first ungrouped params and then all previously grouped params
  const newParameters: IParameters = {}
  Object.entries(parameters).forEach(([k, v]) => {
    if (isObject(v)) {
      // TODO recursivly, now only loops over first direct props
      Object.entries(v as IParameters).forEach(([gk, gv]) => {
        if (gk in uiSchema && 'ui:group' in uiSchema[gk]) {
          newParameters[gk] = gv
        } else {
          if (!(k in newParameters)) {
            newParameters[k] = {}
          }
          (newParameters[k] as IParameters)[gk] = gv
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
  const nodes = catalog.nodes.map((n) => {
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
