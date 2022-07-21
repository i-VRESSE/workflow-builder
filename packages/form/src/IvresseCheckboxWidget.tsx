// Customized from: https://github.com/rjsf-team/react-jsonschema-form/blob/724fb0bc3f1ae5d1d9b761b2bff7cf5c64fd7459/packages/bootstrap-4/src/CheckboxWidget/CheckboxWidget.tsx#L3-L48

import React from 'react'

import { WidgetProps } from '@rjsf/core'
// was import Form from 'react-bootstrap/Form', but vitest in core package complained about `Error: Directory import ... not supported resolving ES modules imported ...`
import Form from 'react-bootstrap/cjs/Form.js'

export const IvresseCheckboxWidget = (props: WidgetProps): JSX.Element => {
  const {
    id,
    value,
    disabled,
    readonly,
    label,
    schema,
    autofocus,
    onChange,
    onBlur,
    onFocus,
    DescriptionField
  } = props

  const _onChange = ({
    target: { checked }
  }: React.FocusEvent<HTMLInputElement>): void => onChange(checked)
  const _onBlur = ({
    target: { checked }
  }: React.FocusEvent<HTMLInputElement>): void => onBlur(id, checked)
  const _onFocus = ({
    target: { checked }
  }: React.FocusEvent<HTMLInputElement>): void => onFocus(id, checked)

  const desc = label !== '' ? label : schema.description
  let descfield = <></>
  if (schema.description !== undefined || schema.description !== '') {
    descfield = <DescriptionField description={schema.description} />
  }
  // Do not forward props.required to Form.Check as it can not be unchecked and valid
  // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input/checkbox#validation
  return (
    <Form.Group className={`checkbox ${disabled || readonly ? 'disabled' : ''}`}>
      <Form.Check
        id={id}
        label={desc}
        checked={typeof value === 'undefined' ? false : value}
        disabled={disabled || readonly}
        autoFocus={autofocus}
        onChange={_onChange}
        type='checkbox'
        onBlur={_onBlur}
        onFocus={_onFocus}
      />
      {descfield}

    </Form.Group>
  )
}
