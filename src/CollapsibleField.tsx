import { FieldProps, utils } from '@rjsf/core'
import { useState } from 'react'
import { CaretDownSquare, CaretUpSquare, PiggyBank } from 'react-bootstrap-icons'

export const CollapsibleField = (props: FieldProps): JSX.Element => {
  if (props.schema.type !== 'object') {
    throw Error('CollapsibleField only works with type:object')
  }
  const ObjectField = props.registry.fields.ObjectField
  const uiOptions = utils.getUiOptions(props.uiSchema)
  const initialCollapsed = uiOptions !== undefined && 'collapsed' in uiOptions ? uiOptions.collapsed === true : true
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const title = extractTitle(props, uiOptions)

  const CollapsedIcon = CaretDownSquare
  const ExpandedIcon = CaretUpSquare

  // To render button + name use styling from https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/bootstrap-4/src/TitleField/TitleField.tsx
  if (collapsed) {
    return (
      <div className='my-1'>
        <h5 onClick={() => setCollapsed(false)}>
          <CollapsedIcon />
          <span className='align-middle'>
            &nbsp;{title}
          </span>
        </h5>
      </div>
    )
  }

  // TitleField inside the ObjectField is not rendered when there is no title or name
  const oprops = dropTitle(props)
  return (
    <div className='my-1'>
      <h5 onClick={() => setCollapsed(true)}>
        <ExpandedIcon />
        <span className='align-middle'>
          &nbsp;{title}
        </span>
      </h5>
      <hr style={{
        'border': '0px'
      }}/>
        <div style={{
          'border': '1px solid #CFCFCF',
          'boxShadow': '4px 4px 15px -5px #CFCFCF',
          'padding': '10px',
          'marginLeft': '2px',
          'borderRadius': '10px'}}>
          <ObjectField {...oprops} />
        </div>
    </div>
  )
}

function extractTitle (props: FieldProps<any>, uiOptions: { [key: string]: string | number | boolean | object | any[] | null } | undefined): string {
  let title = props.name
  if ('title' in props.schema && props.schema.title !== undefined) {
    title = props.schema.title
  }
  if (uiOptions !== undefined && 'title' in uiOptions && typeof uiOptions.title === 'string') {
    title = uiOptions.title
  }
  return title
}

function dropTitle (props: FieldProps<any>): FieldProps<any> {
  const oprops = { ...props }
  oprops.name = ''
  if ('title' in oprops.schema) {
    oprops.schema = { ...oprops.schema }
    oprops.schema.title = ''
  }
  if ('ui:title' in props.uiSchema) {
    oprops.uiSchema = { ...oprops.uiSchema }
    oprops.uiSchema['ui:title'] = ''
  }
  if ('ui:options' in props.uiSchema && props.uiSchema['ui:options'] !== undefined && 'title' in props.uiSchema['ui:options']) {
    oprops.uiSchema = { ...oprops.uiSchema }
    oprops.uiSchema['ui:options'] = { ...props.uiSchema['ui:options'] }
    oprops.uiSchema['ui:options'].title = ''
  }
  return oprops
}
