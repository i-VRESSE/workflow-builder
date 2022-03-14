import { FieldProps } from '@rjsf/core'

import { TableFieldTemplate } from './TableFieldTemplate'
import { TableRowFieldTemplate } from './TableRowFieldTemplate'
import { TableCellFieldTemplate } from './TableCellFieldTemplate'

export const TableField = (props: FieldProps): JSX.Element => {
  (props.uiSchema as any)['ui:ArrayFieldTemplate'] = TableFieldTemplate
  if (!('items' in props.uiSchema)) {
    props.uiSchema.items = {}
  }
  props.uiSchema.items['ui:ObjectFieldTemplate'] = TableRowFieldTemplate
  props.uiSchema.items['ui:FieldTemplate'] = TableCellFieldTemplate
  const ArrayField = props.registry.fields.ArrayField
  return <ArrayField {...props} />
}
