import React from 'react'

import { cleanup, render, screen } from '@testing-library/react'
import { TableField } from './TableField'
import { IdSchema, utils } from '@rjsf/core'
import { JSONSchema7 } from 'json-schema'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

afterEach(cleanup)

describe('<TableField/>', () => {
  let schema: JSONSchema7
  let formData: any
  let props: any
  beforeEach(() => {
    schema = {
      type: 'array',
      title: 'Array of {prop1}',
      items: {
        type: 'object',
        properties: {
          prop1: {
            title: 'Prop 1',
            description: 'Description 1',
            type: 'string'
          }
        },
        additionalProperties: false
      }
    }

    formData = [
      {
        prop1: 'a'
      },
      {
        prop1: 'b'
      },
      {
        prop1: 'c'
      },
      {
        prop1: 'd'
      },
      {
        prop1: 'e'
      },
      {
        prop1: 'f'
      }
    ]
    const idSchema = {
      $id: 'root',
      prop1: {
        $id: 'root_prop1'
      }
    } as any as IdSchema
    const registry = utils.getDefaultRegistry()
    props = {
      id: 'someid',
      label: 'Some label',
      disabled: false,
      readonly: false,
      autofocus: false,
      options: {},
      formContext: {},
      onChange: vi.fn(),
      placeholder: '',
      onBlur: vi.fn(),
      onFocus: vi.fn(),
      multiple: false,
      required: false,
      idSchema,
      name: 'somename',
      errorSchema: {},
      rawErrors: [],
      registry
    }
  })

  describe('with columnIndex in ui:options', () => {
    beforeEach(() => {
      const uiSchema = {
        'ui:field': 'table',
        'ui:options': {
          indexable: true
        }
      }
      render(
        <TableField
          {...props}
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
        />
      )
    })

    it('should have 3 columns (index, prop1, actions)', () => {
      const prop1th = screen.getAllByTitle('Description 1')[0] // use [0] to get th from [th, button]
      expect(prop1th?.parentElement?.children).toHaveLength(3)
    })

    it.each(['0', '1', '2', '4', '5'])(
      'should have an index column with text %s',
      (index) => {
        const cell = screen.getByText(index)
        expect(cell).toBeTruthy()
      }
    )
  })

  describe('with ui:columnIndex=true', () => {
    beforeEach(() => {
      const uiSchema = {
        'ui:field': 'table',
        'ui:indexable': true
      }
      render(
        <TableField
          {...props}
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
        />
      )
    })

    it('should have 3 columns (index, prop1, actions)', () => {
      const prop1th = screen.getAllByTitle('Description 1')[0] // use [0] to get th from [th, button]
      expect(prop1th?.parentElement?.children).toHaveLength(3)
    })

    it.each(['0', '1', '2', '4', '5'])(
      'should have an index column with text %s',
      (index) => {
        const cell = screen.getByText(index)
        expect(cell).toBeTruthy()
      }
    )
  })

  describe('with ui:columnIndex=array', () => {
    beforeEach(() => {
      const uiSchema = {
        'ui:field': 'table',
        'ui:indexable': ['a', 'b', 'c']
      }
      render(
        <TableField
          {...props}
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
        />
      )
    })

    it('should have 3 columns (index, prop1, actions)', () => {
      const prop1th = screen.getAllByTitle('Description 1')[0] // use [0] to get th from [th, button]
      expect(prop1th?.parentElement?.children).toHaveLength(3)
    })

    it.each(['a', 'b', 'c', '4', '5'])(
      'should have an index column with text %s',
      (index) => {
        const cell = screen.getByText(index)
        expect(cell).toBeTruthy()
      }
    )
  })

  describe('table can only render array of objects', () => {
    it('should complain when root type is not an array', () => {
      schema = {
        type: 'string'
      }
      const uiSchema = {}
      const formData = 'foobar'
      expect(() =>
        render(
          <TableField
            {...props}
            schema={schema}
            uiSchema={uiSchema}
            formData={formData}
          />
        )
      ).toThrowError(
        'Table field can only render schema with array type and items type object'
      )
    })

    it.each([
      {
        type: 'string'
      },
      [{
        type: 'string'
      }],
      undefined
    ])('should complain when items type is not an object', (items) => {
      schema = {
        type: 'array',
        items: items as any
      }
      expect(() =>
        render(
          <TableField
            {...props}
            schema={schema}
          />
        )
      ).toThrowError(
        'Table field can only render schema with array type and items type object'
      )
    })
  })
})
