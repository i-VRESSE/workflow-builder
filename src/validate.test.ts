import { beforeEach, describe, expect, it } from 'vitest'
import { JSONSchema7 } from 'json-schema'
import { validateCatalog, validateWorkflow } from './validate'
import { ICatalog, IWorkflowSchema } from './types'
import { JSONSchema7WithMaxItemsFrom } from './resolveMaxItemsFrom'

describe('validateWorkflow()', () => {
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
          schema: globalSchema,
          uiSchema: {}
        },
        nodes: []
      }
    })

    it('should return no errors when parameters are valid against global schema', () => {
      const workflow = {
        global: {
          run_dir: 'run1'
        },
        nodes: []
      }
      const errors = validateWorkflow(workflow, schemas)

      expect(errors).toEqual([])
    })

    it('should return run_dir required error when empty global parameters is given', () => {
      const workflow = {
        global: {},
        nodes: []
      }
      const errors = validateWorkflow(workflow, schemas)

      const expected = [
        {
          instancePath: '',
          keyword: 'required',
          message: "must have required property 'run_dir'",
          params: {
            missingProperty: 'run_dir'
          },
          schemaPath: '#/required',
          workflowPath: 'global'
        }
      ]
      expect(errors).toEqual(expected)
    })
  })

  describe('given schema of node', () => {
    let schemas: IWorkflowSchema

    beforeEach(() => {
      const nodeSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          autohis: {
            type: 'boolean'
          }
        },
        required: ['autohis'],
        additionalProperties: false
      }
      const globalSchema: JSONSchema7 = {
        type: 'object',
        properties: {},
        additionalProperties: false
      }
      schemas = {
        global: {
          schema: globalSchema,
          uiSchema: {}
        },
        nodes: [
          {
            id: 'mynode',
            label: 'My node',
            description: 'My node description',
            category: 'My category',
            schema: nodeSchema,
            uiSchema: {}
          }
        ]
      }
    })

    it('should return no errors when parameters are valid against node schema', () => {
      const workflow = {
        global: {},
        nodes: [
          {
            id: 'mynode',
            parameters: {
              autohis: true
            }
          }
        ]
      }
      const errors = validateWorkflow(workflow, schemas)

      expect(errors).toEqual([])
    })

    it('should return autohis required error when empty node parameters is given', () => {
      const workflow = {
        global: {},
        nodes: [
          {
            id: 'mynode',
            parameters: {}
          }
        ]
      }
      const errors = validateWorkflow(workflow, schemas)

      const expected = [
        {
          instancePath: '',
          keyword: 'required',
          message: "must have required property 'autohis'",
          params: {
            missingProperty: 'autohis'
          },
          schemaPath: '#/required',
          workflowPath: 'nodes[0]'
        }
      ]
      expect(errors).toEqual(expected)
    })

    describe('given node without absent node', () => {
      it('should give a node schema not found error', () => {
        const workflow = {
          global: {},
          nodes: [
            {
              id: 'myothernode',
              parameters: {}
            }
          ]
        }
        const errors = validateWorkflow(workflow, schemas)

        const expected = [
          {
            instancePath: '',
            keyword: 'schema',
            message: 'must have node name belonging to known nodes',
            params: {
              node: 'myothernode'
            },
            schemaPath: '',
            workflowPath: 'nodes[0]'
          }
        ]
        expect(errors).toEqual(expected)
      })
    })
  })

  describe('given node with maxItemsFrom in schema', () => {
    let schemas: IWorkflowSchema

    beforeEach(() => {
      const propSchema: JSONSchema7WithMaxItemsFrom = {
        type: 'array',
        title: 'Which molecules are a shape?',
        items: {
          default: false,
          title: 'Is this molecule a shape?',
          type: 'boolean'
        },
        maxItemsFrom: 'gprop'
      }
      const nodeSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          nprop: propSchema
        }
      }
      const globalSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          gprop: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        },
        additionalProperties: false
      }
      schemas = {
        global: {
          schema: globalSchema,
          uiSchema: {}
        },
        nodes: [
          {
            id: 'mynode',
            label: 'My node',
            description: 'My node description',
            category: 'My category',
            schema: nodeSchema,
            uiSchema: {}
          }
        ]
      }
    })

    it('should return zero errors when same number of items is given as maxItemsFrom field', () => {
      const workflow = {
        global: {
          gprop: ['a', 'b', 'c']
        },
        nodes: [
          {
            id: 'mynode',
            parameters: {
              nprop: [true, false, true]
            }
          }
        ]
      }
      const errors = validateWorkflow(workflow, schemas)

      expect(errors).toEqual([])
    })

    it('should complain when more number of items is given as maxItemsFrom field', () => {
      const workflow = {
        global: {
          gprop: ['a']
        },
        nodes: [
          {
            id: 'mynode',
            parameters: {
              nprop: [true, false, true]
            }
          }
        ]
      }
      const errors = validateWorkflow(workflow, schemas)

      const expected = [
        {
          instancePath: '/nprop',
          keyword: 'maxItems',
          message: 'must NOT have more than 1 items',
          params: {
            limit: 1
          },
          schemaPath: '#/properties/nprop/maxItems',
          workflowPath: 'nodes[0]'
        }
      ]
      expect(errors).toEqual(expected)
    })
  })
})

describe('validateCatalog', () => {
  describe('given catalog with JSON schemas', () => {
    it('should return zero errors', () => {
      const catalog: ICatalog = {
        title: 'Test catalog',
        global: {
          schema: {
            type: 'object',
            properties: {
              someprop: {
                type: 'string'
              }
            }
          },
          uiSchema: {}
        },
        nodes: [{
          id: 'mynode',
          label: 'My node',
          description: 'My node description',
          category: 'My category',
          schema: {
            type: 'object',
            properties: {
              someprop: {
                type: 'string'
              }
            }
          },
          uiSchema: {}
        }],
        examples: {},
        categories: []
      }

      const errors = validateCatalog(catalog)

      expect(errors.length).toEqual(0)
    })
  })

  describe('given global schema with wrong type', () => {
    it('should return errors about that schema', () => {
      const catalog: ICatalog = {
        title: 'Test catalog',
        global: {
          schema: {
            type: 'object',
            properties: {
              someprop: {
                // @ts-expect-error
                type: 'nonexistingtype'
              }
            }
          }
        },
        nodes: [],
        examples: {},
        categories: []
      }

      const errors = validateCatalog(catalog)

      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('given node schema with wrong type', () => {
    it('should return errors about that schema', () => {
      const catalog: ICatalog = {
        title: 'Test catalog',
        global: {
          schema: {
            type: 'object',
            properties: {
              someprop: {
                type: 'string'
              }
            }
          },
          uiSchema: {}
        },
        nodes: [{
          id: 'mynode',
          label: 'My node',
          description: 'My node description',
          category: 'My category',
          schema: {
            type: 'object',
            properties: {
              someprop: {
                // @ts-expect-error
                type: 'nonexistingtype'
              }
            }
          },
          uiSchema: {}
        }]
      }

      const errors = validateCatalog(catalog)

      expect(errors.length).toBeGreaterThan(0)
    })
  })
})
