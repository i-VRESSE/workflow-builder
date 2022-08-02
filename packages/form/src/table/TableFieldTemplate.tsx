import React from 'react'
import { ArrayFieldTemplateProps, utils } from '@rjsf/core'
import { Button, Table, OverlayTrigger, Popover } from 'react-bootstrap'
import { BsDash, BsPlus, BsQuestionCircle } from 'react-icons/bs'

import './TableFieldTemplate.css'

const btnStyle = {
  flex: 1,
  paddingLeft: 6,
  paddingRight: 6,
  fontWeight: 'bold'
}

function isObject (value: unknown): value is object {
  return value !== null && typeof value === 'object'
}

/**
 * This table field template was copied from https://github.com/iomega/paired-data-form/blob/master/app/src/fields/TableFieldTemplate.tsx
 * and adjusted.
 */
export const TableFieldTemplate = (props: ArrayFieldTemplateProps): JSX.Element => {
  const required = new Set((props.schema as any).items.required)
  const rowSchema = (props.schema as any).items.properties
  const uiOptions = utils.getUiOptions(props.uiSchema)
  let widths: { [name: string]: string } = {}
  if (
    uiOptions !== undefined &&
    'widths' in uiOptions &&
    isObject(uiOptions.widths)
  ) {
    widths = uiOptions.widths as { [name: string]: string }
  }
  let indexColumnHeader = <></>
  let indexColumnCell = (_index: string): JSX.Element => <></>
  if (uiOptions !== undefined &&
    'indexable' in uiOptions &&
    typeof uiOptions.indexable === 'boolean' &&
    uiOptions.indexable
  ) {
    indexColumnHeader = <th key='index-th' className='index-th' />
    indexColumnCell = (index: string) => <td style={{ verticalAlign: 'middle' }}>{index}</td>
  }
  const headers = Object.entries(rowSchema).map(
    ([key, s]: [string, any], i: number) => {
      const title = required.has(key)
        ? (
          <label>
            {s.title ?? key}
            <span className='required'>*</span>
          </label>
          )
        : (
          <label>{s.title ?? key}</label>
          )
      let description = (
        <span dangerouslySetInnerHTML={{ __html: s.description }} />
      )
      if (s.type === 'object') {
        const srequired = new Set(s.required)
        const propDescs = Object.entries(s.properties)
          .filter((d: any) => d[1].description)
          .map(([skey, sschema]: any) => (
            <li key={skey}>
              <label className='control-label'>
                {sschema.title}
                {srequired.has(skey) && <span className='required'>*</span>}
              </label>
              <p
                dangerouslySetInnerHTML={{ __html: sschema.description }}
                className='field-description'
              />
            </li>
          ))
        description = (
          <>
            <span dangerouslySetInnerHTML={{ __html: s.description }} />
            <ul>
              {propDescs}
            </ul>
          </>
        )
      }
      const width = widths[key]
      return (
        <th
          key={key}
          title={s.description}
          style={{ width }}
        >
          {title}
          <OverlayTrigger
            trigger='click'
            placement='bottom'
            rootClose
            overlay={
              <Popover id={`popover-${key}`} style={{ maxWidth: '600px' }}>
                <Popover.Title>{title}</Popover.Title>
                <Popover.Content>{description}</Popover.Content>
              </Popover>
            }
          >
            <Button variant='link' size='sm' title={s.description}>
              <BsQuestionCircle />
            </Button>
          </OverlayTrigger>
        </th>
      )
    }
  )
  headers.unshift(indexColumnHeader)
  headers.push(
    <th key='actions-th' className='actions-th'>
      <Button
        className='array-item-add'
        title='Add'
        style={btnStyle}
        onClick={props.onAddClick}
        disabled={props.disabled || props.readonly}
      >
        <BsPlus />
      </Button>
    </th>
  )
  let rows: JSX.Element[] = []
  if ('items' in props) {
    rows = props.items.map((element: any, index) => {
      return (
        <tr key={element.key} className={element.className}>
          {indexColumnCell(`${index}`)}
          {element.children}
          <td className='table-actions'>
            <Button
              type='danger'
              className='array-item-remove btn-light'
              title='Remove'
              style={btnStyle}
              disabled={props.disabled || props.readonly}
              onClick={element.onDropIndexClick(element.index)}
            >
              <BsDash />
            </Button>
          </td>
        </tr>
      )
    })
  }
  return (
    <fieldset className={props.idSchema.$id}>
      <legend>{props.title}</legend>
      <p className='field-description'>{props.schema.description}</p>
      <Table striped bordered size='sm' className='table-field'>
        <thead>
          <tr>{headers}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </fieldset>
  )
}
