import { beforeEach, describe, expect, it } from 'vitest'
import { JSONSchema7 } from 'json-schema'
import { validate } from './validate'
import { IWorkflowSchema } from './types'

describe('validate()', () => {
  describe('given a workflow with only global parameters', () => {
    let schemas: IWorkflowSchema

    beforeEach(() => {
      const globalSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          run_dir: {
            type: 'string'
          }
        },
        required: ['run_dir'],
        additionalProperties: false
      }
      schemas = {
        global: {
          schema: globalSchema
        },
        nodes: []
      }
    })

    it('should return no errors when parameters are valid against global schema', () => {
      const workflow = {
        global: {
          run_dir: 'run1'
        },
        steps: [],
        files: {}
      }
      const errors = validate(workflow, schemas)

      expect(errors).toEqual([])
    })

    it('should return run_dir required error when empty global parameters is given', () => {
      const workflow = {
        global: {},
        steps: [],
        files: {}
      }
      const errors = validate(workflow, schemas)

      const expected = [{
        instancePath: '',
        keyword: 'required',
        message: "must have required property 'run_dir'",
        params: {
          missingProperty: 'run_dir'
        },
        schemaPath: '#/required'
      }]
      expect(errors).toEqual(expected)
    })
  })
})
