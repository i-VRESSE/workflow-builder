import React from 'react'
import { FieldProps } from '@rjsf/core'

import { TableFieldTemplate } from './TableFieldTemplate'
import { TableRowFieldTemplate } from './TableRowFieldTemplate'
import { TableCellFieldTemplate } from './TableCellFieldTemplate'

/**
 * React JSON schema form field to render an array of objects as an table.
 */
export const TableField = (props: FieldProps): JSX.Element => {
  const isArrayType = props.schema.type === 'array'
  const itemsIsObjectType = 'items' in props.schema &&
    props.schema.items !== undefined &&
    !Array.isArray(props.schema.items) &&
    typeof props.schema.items === 'object' &&
    props.schema.items.type === 'object'
  // TODO handle schema with schema.items=[] or schema.prefixItems,
  // see http://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation
  if (!(isArrayType && itemsIsObjectType)) {
    throw Error('Table field can only render schema with array type and items type object')
  }
  props.uiSchema['ui:ArrayFieldTemplate'] = TableFieldTemplate
  if (!('items' in props.uiSchema)) {
    props.uiSchema.items = {}
  }
  props.uiSchema.items['ui:ObjectFieldTemplate'] = TableRowFieldTemplate
  props.uiSchema.items['ui:FieldTemplate'] = TableCellFieldTemplate
  const ArrayField = props.registry.fields.ArrayField
  return <ArrayField {...props} />
}
