import { UiSchema } from '@rjsf/core'
import { JSONSchema7 } from 'json-schema'
import { beforeEach, describe, expect, it } from 'vitest'

import { JSONSchema7WithMaxItemsFrom } from '../resolveMaxItemsFrom'
import { IFiles, IParameters } from '../types'
import {
  addMoleculeUi,
  addMoleculeValidation,
  parseMolecules
} from './addMoleculeValidation'
import { MoleculeInfo } from './parse'

describe('parseMolecules()', () => {
  describe('given bad global schema or parameters', () => {
    const unchangedCases: Array<
    [string, JSONSchema7WithMaxItemsFrom, IParameters, IFiles]
    > = [
      ['schema without props', {}, {}, {}],
      [
        'schema without prop[format=moleculefilepaths]',
        {
          type: 'object',
          properties: {
            prop1: { type: 'array' }
          }
        },
        {},
        {}
      ],
      [
        'parameter without prop[format=moleculefilepaths]',
        {
          type: 'object',
          properties: {
            prop1: { type: 'array', format: 'moleculefilepaths' }
          }
        },
        {},
        {}
      ],
      [
        'parameter[format=moleculefilepaths] is no array',
        {
          type: 'object',
          properties: {
            prop1: { type: 'array', format: 'moleculefilepaths' }
          }
        },
        { prop1: 'foo' },
        {}
      ]
    ]
    it.each(unchangedCases)(
      'given %s should find zero files',
      async (_description, globalSchema, globalParameters, files) => {
        const actual = await parseMolecules(
          globalParameters,
          globalSchema,
          files
        )
        expect(actual).toEqual([[], undefined])
      }
    )
  })
})

describe('addMoleculeValidation()', () => {
  describe('given a molecule with chain A', () => {
    let moleculeInfos: MoleculeInfo[]
    let moleculesPropName: string | undefined

    beforeEach(async () => {
      const globalParameters = {
        molecules: ['a.pdb']
      }
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
      const body =
        'ATOM     32  N  AARG A  -3      11.281  86.699  94.383  0.50 35.88           N  '
      const file =
        'data:text/plain;name=a.pdb;base64,' +
        Buffer.from(body).toString('base64')
      const files = {
        'a.pdb': file
      };
      [moleculeInfos, moleculesPropName] = await parseMolecules(
        globalParameters,
        globalSchema,
        files
      )
    })

    it('should return schema unchanged', async () => {
      const itemsSchema: JSONSchema7 = {
        type: 'string'
      }
      const propSchema: JSONSchema7WithMaxItemsFrom = {
        type: 'array',
        items: itemsSchema
      }
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: propSchema
        }
      }
      const actual = await addMoleculeValidation(
        schema,
        moleculeInfos,
        moleculesPropName
      )
      expect(actual).toEqual(schema)
    })

    describe('in array of array of object with prop with format:chain', () => {
      it('should set enum to [A]', async () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                prop2: {
                  type: 'string',
                  format: 'chain'
                }
              }
            }
          }
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }
        const actual = await addMoleculeValidation(
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedPropSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: [
            {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  prop2: {
                    type: 'string',
                    format: 'chain',
                    enum: ['A']
                  }
                }
              }
            }
          ]
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: expectedPropSchema
          }
        }
        expect(actual).toEqual(expected)
      })
    })

    describe('in array of array of object with prop with format:residue', () => {
      it('should set enum to [-3]', async () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                prop2: {
                  type: 'number',
                  format: 'residue'
                }
              }
            }
          }
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }
        const actual = await addMoleculeValidation(
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedPropSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: [
            {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  prop2: {
                    type: 'number',
                    format: 'residue',
                    enum: [-3]
                  }
                }
              }
            }
          ]
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: expectedPropSchema
          }
        }
        expect(actual).toEqual(expected)
      })
    })

    // Test for topoaa mol prop
    describe('in array of object of array of scalar with format:residue', () => {
      it('should set enum to [-3]', async () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'object',
            properties: {
              prop2: {
                type: 'array',
                items: {
                  type: 'number',
                  format: 'residue'
                }
              },
              prop3: {
                type: 'string'
              }
            }
          }
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema,
            prop4: {
              type: 'boolean'
            }
          }
        }
        const actual = await addMoleculeValidation(
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedPropSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: [
            {
              type: 'object',
              properties: {
                prop2: {
                  type: 'array',
                  items: {
                    type: 'number',
                    format: 'residue',
                    enum: [-3]
                  }
                },
                prop3: {
                  type: 'string'
                }
              }
            }
          ]
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: expectedPropSchema,
            prop4: {
              type: 'boolean'
            }
          }
        }
        expect(actual).toEqual(expected)
      })
    })

    describe('in grouped object of array of array of object with prop with format:residue', () => {
      it('should set enum to [-3]', async () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                prop2: {
                  type: 'number',
                  format: 'residue'
                }
              }
            }
          }
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            group1: {
              type: 'object',
              properties: {
                prop1: propSchema
              }
            }
          }
        }
        const actual = await addMoleculeValidation(
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedPropSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: [
            {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  prop2: {
                    type: 'number',
                    format: 'residue',
                    enum: [-3]
                  }
                }
              }
            }
          ]
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            group1: {
              type: 'object',
              properties: {
                prop1: expectedPropSchema
              }
            }
          }
        }
        expect(actual).toEqual(expected)
      })
    })

    // TODO finish test when fixing molecule awareness of https://github.com/i-VRESSE/workflow-builder/issues/88
    describe.skip('object with maxPropertiesFrom and with prop names with format:chain', () => {
      it('should return formSchema unchanged', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'object',
          additionalProperties: {
            type: 'string'
          },
          propertyNames: {
            format: 'chain'
          },
          maxPropertiesFrom: 'molecules'
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }

        const actual = addMoleculeValidation(
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedPropSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'object',
          properties: {
            A: {
              type: 'string'
            }
          }
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: expectedPropSchema
          }
        }
        expect(actual).toEqual(expected)
      })
    })
  })

  describe('given 2 molecules with chain A and B respectivly', () => {
    let moleculeInfos: MoleculeInfo[]
    let moleculesPropName: string | undefined

    beforeEach(async () => {
      const globalParameters = {
        molecules: ['a.pdb', 'b.pdb']
      }
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
      const bodyA =
        'ATOM     32  N  AARG A  -3      11.281  86.699  94.383  0.50 35.88           N  '
      const fileA =
        'data:text/plain;name=a.pdb;base64,' +
        Buffer.from(bodyA).toString('base64')
      const bodyB =
        'ATOM     32  N  AARG B  42      11.281  86.699  94.383  0.50 35.88           N  '
      const fileB =
        'data:text/plain;name=a.pdb;base64,' +
        Buffer.from(bodyB).toString('base64')
      const files = {
        'a.pdb': fileA,
        'b.pdb': fileB
      };
      [moleculeInfos, moleculesPropName] = await parseMolecules(
        globalParameters,
        globalSchema,
        files
      )
    })

    describe('given array of array of object with props with format:chain, format:residue and no format', () => {
      it('should make items an array and set enums', async () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                prop2: {
                  type: 'string',
                  format: 'chain'
                },
                prop3: {
                  type: 'number',
                  format: 'residue'
                },
                prop4: {
                  type: 'boolean'
                }
              }
            }
          }
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }
        const actual = await addMoleculeValidation(
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedPropSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: [
            {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  prop2: {
                    type: 'string',
                    format: 'chain',
                    enum: ['A']
                  },
                  prop3: {
                    type: 'number',
                    format: 'residue',
                    enum: [-3]
                  },
                  prop4: {
                    type: 'boolean'
                  }
                }
              }
            },
            {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  prop2: {
                    type: 'string',
                    format: 'chain',
                    enum: ['B']
                  },
                  prop3: {
                    type: 'number',
                    format: 'residue',
                    enum: [42]
                  },
                  prop4: {
                    type: 'boolean'
                  }
                }
              }
            }
          ]
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: expectedPropSchema
          }
        }
        expect(actual).toEqual(expected)
      })
    })
  })
})

describe('addMoleculeUi()', () => {
  describe('given a molecule with chain A', () => {
    let moleculeInfos: MoleculeInfo[]
    let moleculesPropName: string | undefined
    beforeEach(async () => {
      const globalParameters = {
        molecules: ['a.pdb']
      }
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
      const body =
        'ATOM     32  N  AARG A  -3      11.281  86.699  94.383  0.50 35.88           N  '
      const file =
        'data:text/plain;name=a.pdb;base64,' +
        Buffer.from(body).toString('base64')
      const files = {
        'a.pdb': file
      };
      [moleculeInfos, moleculesPropName] = await parseMolecules(
        globalParameters,
        globalSchema,
        files
      )
    })
    describe('given array of string with ui:indexable', () => {
      it('should put filenames of pdb as indexable value', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'string'
          }
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }
        const uiSchema = {
          prop1: {
            'ui:indexable': true
          }
        }
        const formUiSchema = addMoleculeUi(
          uiSchema,
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedUiSchema = {
          prop1: {
            'ui:options': {
              indexable: ['a.pdb']
            }
          }
        }
        expect(formUiSchema).toEqual(expectedUiSchema)
      })
    })

    describe('given object with array of string with ui:indexable', () => {
      it('should put filenames of pdb as indexable value', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'string'
          }
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            group1: {
              type: 'object',
              properties: {
                prop1: propSchema
              }
            }
          }
        }
        const uiSchema = {
          group1: {
            prop1: {
              'ui:indexable': true
            }
          }
        }
        const formUiSchema = addMoleculeUi(
          uiSchema,
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedUiSchema = {
          group1: {
            prop1: {
              'ui:options': {
                indexable: ['a.pdb']
              }
            }
          }
        }
        expect(formUiSchema).toEqual(expectedUiSchema)
      })
    })

    const unchangedCases: Array<
    [string, JSONSchema7WithMaxItemsFrom, UiSchema]
    > = [
      [
        'no ui:indexable',
        {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'string'
          }
        },
        {}
      ],
      [
        'no maxItemsFrom',
        {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        {
          prop1: {
            'ui:indexable': true
          }
        }
      ],
      [
        'maxItemsFrom!=molecules',
        {
          type: 'array',
          maxItemsFrom: 'pdfs',
          items: {
            type: 'string'
          }
        },
        {
          prop1: {
            'ui:indexable': true
          }
        }
      ]
    ]
    it.each(unchangedCases)(
      'given %s should return uiSchema unchanged',
      (_description, propSchema, uiSchema) => {
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }
        const formUiSchema = addMoleculeUi(
          uiSchema,
          schema,
          moleculeInfos,
          moleculesPropName
        )
        expect(formUiSchema).toEqual(uiSchema)
      }
    )
  })

  it('should return uiSchema unchanged when there are no molecules', () => {
    const propSchema: JSONSchema7WithMaxItemsFrom = {
      type: 'array',
      maxItemsFrom: 'molecules',
      items: {
        type: 'string'
      }
    }
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        prop1: propSchema
      }
    }
    const uiSchema = {
      prop1: {
        'ui:indexable': true
      }
    }
    const formUiSchema = addMoleculeUi(uiSchema, schema, [], undefined)
    expect(formUiSchema).toEqual(uiSchema)
  })
})
