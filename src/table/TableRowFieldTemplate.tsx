import { FieldProps } from '@rjsf/core'

export const TableRowFieldTemplate = ({ properties }: FieldProps): JSX.Element => {
  return properties.map((prop: any) => {
    return (
      <td className='table-cell-field' key={prop.content.key}>
        {prop.content}
      </td>
    )
  })
}
