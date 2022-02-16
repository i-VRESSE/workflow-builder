import { FieldProps } from '@rjsf/core'
import { useState } from 'react'
import { CaretDownSquare, CaretUpSquare } from 'react-bootstrap-icons'

export const CollapsibleField = (props: FieldProps): JSX.Element => {
  if (props.schema.type !== 'object') {
    throw Error('CollapsibleField only works with type:object')
  }
  const ObjectField = props.registry.fields.ObjectField
  const initialCollapsed: boolean = 'ui:collapsed' in props.uiSchema ? props.uiSchema['ui:collapsed'] : true
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const CollapsedIcon = CaretDownSquare
  const ExpandedIcon = CaretUpSquare
  // TODO animate expansing or collapsing

  // To render button + name use styling from https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/bootstrap-4/src/TitleField/TitleField.tsx
  if (collapsed) {
    return (
      <div className='my-1'>
        <h5 onClick={() => setCollapsed(false)}>
          <CollapsedIcon />
          &nbsp;
          {props.name}
        </h5>
        <hr className='border-0 bg-secondary' style={{ height: '1px' }} />
      </div>
    )
  }

  const { name, ...oprops } = props
  // By setting name to falsy the TitleField component is not rendered
  oprops.name = ''
  return (
    <div className='my-1'>
      <h5 onClick={() => setCollapsed(true)}>
        <ExpandedIcon />
        &nbsp;
        {name}
      </h5>
      <hr className='border-0 bg-secondary' style={{ height: '1px' }} />
      <ObjectField {...oprops as FieldProps} />
    </div>
  )
}
