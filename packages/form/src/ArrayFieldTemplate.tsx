import { AddButtonProps, ArrayFieldTemplateProps, IdSchema, utils } from '@rjsf/core'
import React from 'react'
import Button, { ButtonProps } from 'react-bootstrap/cjs/Button.js'
import Col from 'react-bootstrap/cjs/Col.js'
import Container from 'react-bootstrap/cjs/Container.js'
import Row from 'react-bootstrap/cjs/Row.js'
import { AiOutlineArrowDown, AiOutlineArrowUp } from 'react-icons/ai/index.js'
import { BsPlus } from 'react-icons/bs/index.js'
import { GrAdd } from 'react-icons/gr/index.js'
import { IoIosRemove } from 'react-icons/io/index.js'
import { useIndexable } from './useIndexable'
/**
 * Same are original ArrayFieldTemplate, but adds optional index to each row
 *
 */

/*
 * Due to inflexibility to customize a small part of the original field component the whole file has been copied from
 * [packages/bootstrap-4/src/ArrayFieldTemplate/ArrayFieldTemplate.tsx](https://github.com/rjsf-team/react-jsonschema-form/tree/master/packages/bootstrap-4/src/ArrayFieldTemplate/ArrayFieldTemplate.tsx)
 */
/* As the code has been copied from https://github.com/rjsf-team/react-jsonschema-form it does not adhere to same lint rules */
/* to make it easier to keep up to date several lint rules have been disabled in this file */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

const { isMultiSelect, getDefaultRegistry } = utils

export const ArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
  const { schema, registry = getDefaultRegistry() } = props

  if (isMultiSelect(schema, registry.rootSchema)) {
    return <DefaultFixedArrayFieldTemplate {...props} />
  } else {
    return <DefaultNormalArrayFieldTemplate {...props} />
  }
}

// Copied from packages/bootstrap-4/src/AddButton/AddButton.tsx in react-jsonschema-form repo
const AddButton: React.FC<AddButtonProps> = (props) => (
  <Button
    {...props}
    style={{ width: '100%' }}
    className={`ml-1 ${props.className}`}
  >
    <BsPlus />
  </Button>
)

// packages/bootstrap-4/src/IconButton/IconButton.tsx in react-jsonschema-form repo
const mappings: any = {
  remove: <IoIosRemove />,
  plus: <GrAdd />,
  'arrow-up': <AiOutlineArrowUp />,
  'arrow-down': <AiOutlineArrowDown />
}

type IconButtonProps = ButtonProps & {
  icon: string
  variant?: ButtonProps['variant']
  className?: string
  tabIndex?: number
  style?: any
  disabled?: any
  onClick?: any
}

const IconButton = (props: IconButtonProps) => {
  const { icon, className, ...otherProps } = props
  return (
    <Button {...otherProps} variant={props.variant || 'light'} size='sm'>
      {mappings[icon]}
    </Button>
  )
}

interface ArrayFieldTitleProps {
  TitleField: any
  idSchema: IdSchema
  title: string
  required: boolean
}

const ArrayFieldTitle = ({
  TitleField,
  idSchema,
  title,
  required
}: ArrayFieldTitleProps) => {
  if (!title) {
    return null
  }

  const id = `${idSchema.$id}__title`
  return <TitleField id={id} title={title} required={required} />
}

interface ArrayFieldDescriptionProps {
  DescriptionField: any
  idSchema: IdSchema
  description: string
}

const ArrayFieldDescription = ({
  DescriptionField,
  idSchema,
  description
}: ArrayFieldDescriptionProps) => {
  if (!description) {
    return null
  }

  const id = `${idSchema.$id}__description`
  return <DescriptionField id={id} description={description} />
}

// Used in the two templates
const DefaultArrayItem = (props: any) => {
  const btnStyle = {
    flex: 1,
    paddingLeft: 6,
    paddingRight: 6,
    fontWeight: 'bold'
  }
  /* New code not found in https://github.com/rjsf-team/react-jsonschema-form */
  const childType = props.children.props.schema.type
  const potentiallyHighChild = (childType === 'object' || childType === 'array')
  const verticalAlign = potentiallyHighChild ? 'align-items-top' : 'align-items-center'
  return (
    <div key={props.key}>
      <Row className={`mb-2 d-flex ${verticalAlign}`}>
        {props.indexable
          ? (
            <>
              <Col xs='2' lg='2'>
                {props.indexLookup(props.index)}
              </Col>
              <Col xs='8' lg='8'>
                {props.children}
              </Col>
            </>
            )
          : (
            <Col xs='10' lg='10'>
              {props.children}
            </Col>
            )}

        <Col xs='2' lg='2' className='py-4'>
          {props.hasToolbar && (
            <div className='d-flex flex-row'>
              {(props.hasMoveUp || props.hasMoveDown) && (
                <div className='m-0 p-0'>
                  <IconButton
                    icon='arrow-up'
                    className='array-item-move-up'
                    tabIndex={-1}
                    style={btnStyle as any}
                    disabled={
                      props.disabled || props.readonly || !props.hasMoveUp
                    }
                    onClick={props.onReorderClick(props.index, props.index - 1)}
                  />
                </div>
              )}

              {(props.hasMoveUp || props.hasMoveDown) && (
                <div className='m-0 p-0'>
                  <IconButton
                    icon='arrow-down'
                    tabIndex={-1}
                    style={btnStyle as any}
                    disabled={
                      props.disabled || props.readonly || !props.hasMoveDown
                    }
                    onClick={props.onReorderClick(props.index, props.index + 1)}
                  />
                </div>
              )}

              {props.hasRemove && (
                <div className='m-0 p-0'>
                  <IconButton
                    icon='remove'
                    tabIndex={-1}
                    style={btnStyle as any}
                    disabled={props.disabled || props.readonly}
                    onClick={props.onDropIndexClick(props.index)}
                  />
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>
    </div>
  )
}

const DefaultFixedArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
  // New code not found in https://github.com/rjsf-team/react-jsonschema-form
  const [indexable, indexLookup] = useIndexable(props.uiSchema)

  return (
    <fieldset className={props.className}>
      <ArrayFieldTitle
        key={`array-field-title-${props.idSchema.$id}`}
        TitleField={props.TitleField}
        idSchema={props.idSchema}
        title={props.uiSchema['ui:title'] || props.title}
        required={props.required}
      />

      {(props.uiSchema['ui:description'] || props.schema.description) && (
        <div
          className='field-description'
          key={`field-description-${props.idSchema.$id}`}
        >
          {props.uiSchema['ui:description'] || props.schema.description}
        </div>
      )}

      <div
        className='row array-item-list'
        key={`array-item-list-${props.idSchema.$id}`}
      >
        {props.items &&
          props.items.map((p) => DefaultArrayItem({ ...p, indexable, indexLookup }))}
      </div>

      {props.canAdd && (
        <AddButton
          className='array-item-add'
          onClick={props.onAddClick}
          disabled={props.disabled || props.readonly}
        />
      )}
    </fieldset>
  )
}

const DefaultNormalArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
  // New code not found in https://github.com/rjsf-team/react-jsonschema-form
  const [indexable, indexLookup] = useIndexable(props.uiSchema)

  return (
    <div>
      <Row className='p-0 m-0'>
        <Col className='p-0 m-0'>
          <ArrayFieldTitle
            key={`array-field-title-${props.idSchema.$id}`}
            TitleField={props.TitleField}
            idSchema={props.idSchema}
            title={props.uiSchema['ui:title'] || props.title}
            required={props.required}
          />

          {(props.uiSchema['ui:description'] || props.schema.description) && (
            <ArrayFieldDescription
              key={`array-field-description-${props.idSchema.$id}`}
              DescriptionField={props.DescriptionField}
              idSchema={props.idSchema}
              description={
                props.uiSchema['ui:description'] || props.schema.description
              }
            />
          )}

          <Container
            fluid
            key={`array-item-list-${props.idSchema.$id}`}
            className='p-0 m-0'
          >
            {props.items &&
              props.items.map((p) => DefaultArrayItem({ ...p, indexable, indexLookup }))}

            {props.canAdd && (
              <Container className=''>
                <Row className='mt-2'>
                  <Col xs={9} />
                  <Col xs={3} className='py-4 col-lg-3 col-3'>
                    {' '}
                    <AddButton
                      className='array-item-add'
                      onClick={props.onAddClick}
                      disabled={props.disabled || props.readonly}
                    />
                  </Col>
                </Row>
              </Container>
            )}
          </Container>
        </Col>
      </Row>
    </div>
  )
}
