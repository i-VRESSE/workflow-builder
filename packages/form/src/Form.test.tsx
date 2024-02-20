import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { JSONSchema7 } from 'json-schema'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import validator from "@rjsf/validator-ajv8"
import { Form } from './Form'

afterEach(cleanup)

describe('<Form/>', () => {
  describe('given collapsible property', () => {
    let onSubmit
    beforeEach(() => {
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          group1: {
            type: 'object',
            properties: {
              prop1: {
                type: 'string'
              }
            }
          }
        }
      }

      const uiSchema = {
        group1: {
          'ui:field': 'collapsible'
        }
      }

      const formData = {}
      onSubmit = vi.fn()

      render(
        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          onSubmit={onSubmit}
          validator={validator}
        />
      )
    })

    it('should render collapse button', () => {
      const collapseButton = screen.getByText('group1')
      expect(collapseButton).toBeTruthy()
    })

    it.skip('should not render prop1 input as it is collapsed', () => {
      const input = screen.queryByText('prop1')
      // console.log(input)
      expect(input).toBeNull()
    })

    describe('given collapse button is pressed', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText('group1'))
      })

      it('should render prop1 input', () => {
        const input = screen.getByText('prop1')
        expect(input).toBeTruthy()
      })
    })
  })

  describe('given a array of string rendered as list', () => {
    let onSubmit
    beforeEach(() => {
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          nested1: {
            type: 'array',
            title: 'Array of string',
            items: {
              type: 'string',
              title: 'propn'
            }
          }
        }
      }

      const uiSchema = {}

      const formData = {
        nested1: ['a', 'b', 'c', 'd', 'e', 'f']
      }
      onSubmit = vi.fn()

      render(
        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          onSubmit={onSubmit}
          validator={validator}
        />
      )
    })

    it('should render 6 rows', () => {
      const labels = screen.getAllByText(/propn/)
      expect(labels).toHaveLength(6)
    })
  })
})
