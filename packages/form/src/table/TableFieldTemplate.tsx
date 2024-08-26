import React from 'react'
import { ArrayFieldTemplateProps, utils } from '@rjsf/core'
import { Button, Table, OverlayTrigger, Popover } from 'react-bootstrap'
import { BsDash, BsPlus, BsQuestionCircle } from 'react-icons/bs/index.js'

import './TableFieldTemplate.css'
import { useIndexable } from '../useIndexable'

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
  let indexColumnHeader
  let indexColumnCell = (_index: number): JSX.Element => <></>
  const [indexable, indexLookup] = useIndexable(props.uiSchema)
  if (indexable) {
    indexColumnHeader = <th key={`${props.title}-index-th`} className='index-th' />
    indexColumnCell = (index: number) => <td style={{ verticalAlign: 'middle' }}>{indexLookup(index)}</td>
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
            <li key={`${props.title}-${skey as string}`}>
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
      // not finding description in then and else blocks as not supported in table
      const width = widths[key]
      return (
        <th
          key={`${props.title}-${key}`}
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
  // add indexing column header only if needed
  if (typeof indexColumnHeader !== 'undefined') headers.unshift(indexColumnHeader)
  // add button as first column
  headers.unshift(
    <th key={`${props.title}-actions-th`} className='actions-th'>
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
      const unique: string = `${props.title}-${element?.key as string}-${index.toString()}`
      return (
        // remove button as first column
        <tr key={unique} className={element.className}>
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
          {indexColumnCell(index)}
          {element.children}
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
