import { beforeEach, describe, expect, it } from 'vitest'
import { JSONSchema7 } from 'json-schema'
import { validateCatalog, validateWorkflow } from './validate'
import { ICatalog, IFiles, IWorkflowSchema } from './types'
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

    it('should return no errors when parameters are valid against global schema', async () => {
      const workflow = {
        global: {
          run_dir: 'run1'
        },
        nodes: []
      }
      const errors = await validateWorkflow(workflow, schemas)

      expect(errors).toEqual([])
    })

    it('should return run_dir required error when empty global parameters is given', async () => {
      const workflow = {
        global: {},
        nodes: []
      }
      const errors = await validateWorkflow(workflow, schemas)

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

    it('should return no errors when parameters are valid against node schema', async () => {
      const workflow = {
        global: {},
        nodes: [
          {
            type: 'mynode',
            parameters: {
              autohis: true
            },
            id: 'mynode1'
          }
        ]
      }
      const errors = await validateWorkflow(workflow, schemas)

      expect(errors).toEqual([])
    })

    it('should return autohis required error when empty node parameters is given', async () => {
      const workflow = {
        global: {},
        nodes: [
          {
            type: 'mynode',
            parameters: {},
            id: 'mynode1'
          }
        ]
      }
      const errors = await validateWorkflow(workflow, schemas)

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
      it('should give a node schema not found error', async () => {
        const workflow = {
          global: {},
          nodes: [
            {
              type: 'myothernode',
              parameters: {},
              id: 'myothernode1'
            }
          ]
        }
        const errors = await validateWorkflow(workflow, schemas)

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

    it('should return zero errors when same number of items is given as maxItemsFrom field', async () => {
      const workflow = {
        global: {
          gprop: ['a', 'b', 'c']
        },
        nodes: [
          {
            type: 'mynode',
            parameters: {
              nprop: [true, false, true]
            },
            id: 'mynode1'
          }
        ]
      }
      const errors = await validateWorkflow(workflow, schemas)

      expect(errors).toEqual([])
    })

    it('should complain when more number of items is given as maxItemsFrom field', async () => {
      const workflow = {
        global: {
          gprop: ['a']
        },
        nodes: [
          {
            type: 'mynode',
            parameters: {
              nprop: [true, false, true]
            },
            id: 'mynode1'
          }
        ]
      }
      const errors = await validateWorkflow(workflow, schemas)

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

  describe('given parameter with format:chain', () => {
    let schemas: IWorkflowSchema
    let files: IFiles

    beforeEach(() => {
      const globalSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          molecules: {
            type: 'array',
            format: 'moleculefilepaths',
            items: {
              type: 'string'
            }
          }
        }
      }
      const body = 'ATOM     32  N  AARG A  -3      11.281  86.699  94.383  0.50 35.88           N  '
      const file = 'data:text/plain;name=a.pdb;base64,' + Buffer.from(body).toString('base64')
      files = {
        'a.pdb': file
      }
      const propSchema: JSONSchema7WithMaxItemsFrom = {
        type: 'array',
        maxItemsFrom: 'molecules',
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              chain: {
                type: 'string',
                format: 'chain',
                enum: ['A']
              }
            }
          }
        }
      }
      const nodeSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          seg: propSchema
        }
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

    describe('with valid chain', () => {
      it('should return zero errors', async () => {
        const workflow = {
          global: {
            molecules: ['a.pdb']
          },
          nodes: [
            {
              type: 'mynode',
              parameters: {
                seg: [[{ chain: 'A' }]]
              },
              id: 'mynode1'
            }
          ]
        }
        const errors = await validateWorkflow(workflow, schemas, files)

        expect(errors).toEqual([])
      })
    })

    describe('with invalid chain', () => {
      it('should return 1 error', async () => {
        const workflow = {
          global: {
            molecules: ['a.pdb']
          },
          nodes: [
            {
              type: 'mynode',
              parameters: {
                seg: [[{ chain: 'X' }]]
              },
              id: 'mynode1'
            }
          ]
        }

        const errors = await validateWorkflow(workflow, schemas, files)

        const expected = [{
          instancePath: '/seg/0/0/chain',
          keyword: 'enum',
          message: 'must be equal to one of the allowed values',
          params: {
            allowedValues: ['A']
          },
          schemaPath: '#/properties/seg/items/0/items/properties/chain/enum',
          workflowPath: 'nodes[0]'
        }]
        expect(errors).toEqual(expected)
      })
    })
  })

  describe('given gloal schema with ifthenelse block', () => {
    it('should be valid when then parameter is given', async () => {
      const schemas: IWorkflowSchema = {
        global: {
          schema: {
            type: 'object',
            properties: {
              ifpar: {
                type: 'boolean',
                default: false
              }
            },
            if: {
              properties: {
                ifpar: {
                  const: true
                }
              }
            },
            then: {
              properties: {
                thenpar: {
                  type: 'number'
                }
              }
            },
            else: {
              properties: {
                elsepar: {
                  type: 'number'
                }
              }
            }
          },
          uiSchema: {

          }
        },
        nodes: []
      }
      const workflow = {
        global: {
          ifpar: true,
          thenpar: 1234
        },
        nodes: []
      }
      const errors = await validateWorkflow(workflow, schemas)
      expect(errors).toEqual([])
    })

    it('should be invalid when invalid then parameter is given', async () => {
      const schemas: IWorkflowSchema = {
        global: {
          schema: {
            type: 'object',
            properties: {
              ifpar: {
                type: 'boolean',
                default: false
              }
            },
            if: {
              properties: {
                ifpar: {
                  const: true
                }
              }
            },
            then: {
              properties: {
                thenpar: {
                  type: 'number',
                  minimum: 0
                }
              }
            },
            else: {
              properties: {
                elsepar: {
                  type: 'number'
                }
              }
            }
          },
          uiSchema: {

          }
        },
        nodes: []
      }
      const workflow = {
        global: {
          ifpar: true,
          thenpar: -1234
        },
        nodes: []
      }
      const errors = await validateWorkflow(workflow, schemas)
      expect(errors).toEqual([{
        instancePath: '/thenpar',
        keyword: 'minimum',
        message: 'must be >= 0',
        params: {
          comparison: '>=',
          limit: 0
        },
        schemaPath: '#/then/properties/thenpar/minimum',
        workflowPath: 'global'
      }])
    })
  })
})

describe('validateCatalog()', () => {
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

  describe('given node schema with maxItemsFrom keyword', () => {
    it('should be OK', () => {
      const propSchema: any = {
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
      const catalog: ICatalog = {
        title: 'Test catalog',
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
        ],
        examples: {},
        categories: []
      }

      const errors = validateCatalog(catalog)

      expect(errors.length).toEqual(0)
    })
  })
})
