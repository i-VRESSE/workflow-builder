// Customized from: https://github.com/rjsf-team/react-jsonschema-form/blob/724fb0bc3f1ae5d1d9b761b2bff7cf5c64fd7459/packages/bootstrap-4/src/CheckboxWidget/CheckboxWidget.tsx#L3-L48

import React from 'react'

import { WidgetProps } from '@rjsf/core'
import Form from 'react-bootstrap/Form'

export const IvresseCheckboxWidget = (props: WidgetProps): JSX.Element => {
  const {
    id,
    value,
    required,
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

  return (
    <Form.Group className={`checkbox ${disabled || readonly ? 'disabled' : ''}`}>
      <Form.Check
        id={id}
        label={desc}
        checked={typeof value === 'undefined' ? false : value}
        required={required}
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
