import React, { useState } from 'react'
import { FieldProps, utils } from '@rjsf/core'

// Caret up with square around icon is not in react-icons package, copied from https://icons.getbootstrap.com/icons/caret-up-square/
const CaretUpSquare = (): JSX.Element => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='20'
    height='20'
    fill='currentColor'
    className='bi bi-caret-up-square'
    viewBox='0 0 16 16'
  >
    <path d='M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z' />
    <path d='M3.544 10.705A.5.5 0 0 0 4 11h8a.5.5 0 0 0 .374-.832l-4-4.5a.5.5 0 0 0-.748 0l-4 4.5a.5.5 0 0 0-.082.537z' />
  </svg>
)

// Caret down with square around icon is not in react-icons package, copied from https://icons.getbootstrap.com/icons/caret-down-square/
const CaretDownSquare = (): JSX.Element => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='20'
    height='20'
    fill='currentColor'
    className='bi bi-caret-down-square'
    viewBox='0 0 16 16'
  >
    <path d='M3.626 6.832A.5.5 0 0 1 4 6h8a.5.5 0 0 1 .374.832l-4 4.5a.5.5 0 0 1-.748 0l-4-4.5z' />
    <path d='M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2z' />
  </svg>
)

// Error icon shown in error (comes from bootstrap.css)
const ErrorIcon = (): JSX.Element => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      fill='none'
      stroke='#dc3545'
      viewBox='0 0 12 12'
    >
      <circle cx='6' cy='6' r='4.5' />
      <path strokeLinejoin='round' d='M5.8 3.6h.4L6 6.5z' />
      <circle cx='6' cy='8.2' r='.6' fill='#dc3545' stroke='none' />
    </svg>
  )
}

const CollapsedIcon = CaretDownSquare
const ExpandedIcon = CaretUpSquare

export const CollapsibleField = (props: FieldProps): JSX.Element => {
  if (props.schema.type !== 'object') {
    throw Error('CollapsibleField only works with type:object')
  }
  const ObjectField = props.registry.fields.ObjectField
  const uiOptions = utils.getUiOptions(props.uiSchema)
  const initialCollapsed =
    uiOptions !== undefined && 'collapsed' in uiOptions
      ? uiOptions.collapsed === true
      : true
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const title = extractTitle(props, uiOptions)
  const expanderId = props.id ?? `expander4${props.name.replaceAll(' ', '_')}` // TODO find rjsf func to get more stable

  // check for errors in the field. On error we show title in red and warning icon
  const hasError = Object.keys(props.errorSchema).length > 0

  return (
    <div className='card'>
      <div
        className={`card-header panel-title ${hasError ? 'text-danger' : ''}`}
        id={expanderId}
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '1rem',
          cursor: 'pointer'
        }}
        onClick={() => {
          setCollapsed(!collapsed)
        }}
      >
        {/* icon */}
        {collapsed ? <CollapsedIcon /> : <ExpandedIcon />}
        {/* title */}
        <h5 style={{
          flex: 1,
          margin: 0,
          padding: 0
        }}
        >
          {title}
        </h5>
        {/* error icon */}
        {hasError ? <div title={JSON.stringify(props.errorSchema)}><ErrorIcon /></div> : null}
      </div>
      {/* show content when not collapsed */}
      {/* TitleField inside the ObjectField is not rendered when there is no title or name */}
      {!collapsed ? <div className='card-body'><ObjectField {...dropTitle(props)} /></div> : null}
    </div>
  )
}

function extractTitle (
  props: FieldProps<any>,
  uiOptions:
  | { [key: string]: string | number | boolean | object | any[] | null }
  | undefined
): string {
  let title = props.name
  if ('title' in props.schema && props.schema.title !== undefined) {
    title = props.schema.title
  }
  if (
    uiOptions !== undefined &&
    'title' in uiOptions &&
    typeof uiOptions.title === 'string'
  ) {
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
  if (
    'ui:options' in props.uiSchema &&
    props.uiSchema['ui:options'] !== undefined &&
    'title' in props.uiSchema['ui:options']
  ) {
    oprops.uiSchema = { ...oprops.uiSchema }
    oprops.uiSchema['ui:options'] = { ...props.uiSchema['ui:options'] }
    oprops.uiSchema['ui:options'].title = ''
  }
  return oprops
}
