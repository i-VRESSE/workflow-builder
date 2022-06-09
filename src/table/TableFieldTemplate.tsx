import { ArrayFieldTemplateProps } from '@rjsf/core'
import { Button, Table, OverlayTrigger, Popover } from 'react-bootstrap'
import { Dash, Plus, QuestionCircle } from 'react-bootstrap-icons'

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
  let widths: { [name: string]: string } = {}
  if (
    props.uiSchema['ui:options'] !== undefined &&
    'widths' in props.uiSchema['ui:options'] &&
    isObject(props.uiSchema['ui:options'].widths)
  ) {
    widths = props.uiSchema['ui:options'].widths as { [name: string]: string }
  }
  const headers = Object.entries(rowSchema).map(
    ([key, s]: [string, any], i: number) => {
      const title = required.has(key)
        ? (
          <label>
            {s.title}
            <span className='required'>*</span>
          </label>
          )
        : (
          <label>{s.title}</label>
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
              <QuestionCircle />
            </Button>
          </OverlayTrigger>
        </th>
      )
    }
  )
  headers.push(
    <th key='actions-th'>
      <Button
        className='array-item-add'
        title='Add'
        style={btnStyle}
        onClick={props.onAddClick}
        disabled={props.disabled || props.readonly}
      >
        <Plus />
      </Button>
    </th>
  )
  let rows: JSX.Element[] = []
  if ('items' in props) {
    rows = props.items.map((element: any) => {
      return (
        <tr key={element.key} className={element.className}>
          {element.children}
          <td>
            <Button
              type='danger'
              className='array-item-remove btn-light'
              title='Remove'
              style={btnStyle}
              disabled={props.disabled || props.readonly}
              onClick={element.onDropIndexClick(element.index)}
            >
              <Dash />
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
