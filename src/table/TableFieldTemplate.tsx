import { ArrayFieldTemplateProps } from '@rjsf/core'
import { Button, Table, OverlayTrigger, Popover, Row, Container, Col } from 'react-bootstrap'
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
        const propDescs = Object.entries(s.properties)
          .filter((d: any) => d[1].description)
          .map(([skey, sschema]: any) => (
            <li key={skey}>
              <label className='control-label'>{sschema.title}</label>
              <p
                dangerouslySetInnerHTML={{ __html: sschema.description }}
                className='field-description'
              />
            </li>
          ))
        const depDescs: any[] = []
        const depCache = new Set()
        if (isObject(s.dependencies)) {
          Object.values(s.dependencies).forEach((oneOf: any) => {
            oneOf.oneOf.forEach((o: any) => {
              Object.entries(o.properties)
                .filter((d: any) => d[1].description)
                .forEach(([okey, oschema]: any) => {
                  if (depCache.has(oschema.title)) {
                    return
                  }
                  depCache.add(oschema.title)
                  depDescs.push(
                    <li key={okey}>
                      <label className='control-label'>{oschema.title}</label>
                      <p
                        dangerouslySetInnerHTML={{
                          __html: oschema.description
                        }}
                        className='field-description'
                      />
                    </li>
                  )
                })
            })
          })
        }
        description = (
          <>
            <span dangerouslySetInnerHTML={{ __html: s.description }} />
            <ul>
              {propDescs}
              {depDescs}
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
          {s.title}
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
  headers.push(<th key='actions-th' />)
  let rows: JSX.Element[] = []
  if ('items' in props) {
    rows = props.items.map((element: any) => {
      return (
        <tr key={element.key} className={element.className}>
          {element.children}
          <td>
            <Button
              type='danger'
              className='array-item-remove'
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
      <Container className=''>
        <Row className='mt-2'>
          <Col xs={11} />
          <Col xs={1}>
            <Button
              className='array-item-add'
              title='Add'
              onClick={props.onAddClick}
              disabled={props.disabled || props.readonly}
            >
              <Plus />
            </Button>
          </Col>
        </Row>
      </Container>
    </fieldset>
  )
}
