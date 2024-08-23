import { expect, describe, it } from 'vitest'
import { JSONSchema7 } from 'json-schema'
import { pruneDefaults } from './pruner'

function p1 (v: JSONSchema7): JSONSchema7 {
  return {
    type: 'object',
    properties: {
      prop1: v
    },
    additionalProperties: false
  }
}

describe('pruneDefaults()', () => {
  const cases: Array<[string, any, JSONSchema7, any, any?]> = [
    [
      'given empty parameters should return unchanged',
      {},
      {
        type: 'object',
        properties: {},
        additionalProperties: false
      },
      {}
    ],
    [
      'given parameters which has no default ',
      {
        prop1: 'something'
      },
      p1({
        type: 'string'
      }),
      {
        prop1: 'something'
      }
    ],
    [
      'given parameters which is set to non-default should return unchanged',
      {
        prop1: 'something'
      },
      p1({
        type: 'string',
        default: 'somethingelse'
      }),
      {
        prop1: 'something'
      }
    ],
    [
      'given a string and is set to default should not include prop',
      {
        prop1: 'something'
      },
      p1({
        type: 'string',
        default: 'something'
      }),
      {}
    ],
    [
      'given an empty string and is set to default should not include prop',
      {
        prop1: ''
      },
      p1({
        type: 'string',
        default: ''
      }),
      {}
    ],
    [
      'given an empty string and default is something should include prop',
      {
        prop1: ''
      },
      p1({
        type: 'string',
        default: 'something'
      }),
      {
        prop1: ''
      }
    ],
    [
      'given a integer and is set to default should not include prop',
      {
        prop1: 8
      },
      p1({
        type: 'number',
        default: 8
      }),
      {}
    ],
    [
      'given a float and is set to default should not include prop',
      {
        prop1: 3.14
      },
      p1({
        type: 'number',
        default: 3.14
      }),
      {}
    ],
    [
      'given false and is set to default should not include prop',
      {
        prop1: false
      },
      p1({
        type: 'boolean',
        default: false
      }),
      {}
    ],
    [
      'given true and is set to default should not include prop',
      {
        prop1: true
      },
      p1({
        type: 'boolean',
        default: true
      }),
      {}
    ],
    [
      'given prop inside object is set to default should not include object',
      {
        prop1: {
          prop2: 'something'
        }
      },
      p1({
        type: 'object',
        properties: {
          prop2: {
            type: 'string',
            default: 'something'
          }
        }
      }),
      {}
    ],
    [
      'given prop is set to default and second prop without default',
      {
        prop1: 'something',
        prop2: 42
      },
      {
        type: 'object',
        properties: {
          prop1: {
            type: 'string',
            default: 'something'
          },
          prop2: {
            type: 'number'
          }
        },
        additionalProperties: false
      },
      {
        prop2: 42
      }
    ],
    [
      'given [] and is set to default should not include prop',
      {
        prop1: []
      },
      p1({
        type: 'array',
        default: []
      }),
      {}
    ],
    [
      'given prop inside object is set to default and second prop inside object',
      {
        prop1: {
          prop2: 'something',
          prop3: 42
        }
      },
      p1({
        type: 'object',
        properties: {
          prop2: {
            type: 'string',
            default: 'something'
          },
          prop3: {
            type: 'number'
          }
        }
      }),
      {
        prop1: {
          prop3: 42
        }
      }
    ],
    [
      'given array items is string and has default',
      {
        prop1: ['something']
      },
      p1({
        type: 'array',
        items: {
          type: 'string',
          default: 'something'
        }
      }),
      { prop1: ['something'] },
      {}
    ],
    [
      'given array item is untyped and has default',
      {
        prop1: ['something']
      },
      p1({
        type: 'array'
      }),
      {
        prop1: ['something']
      }
    ],
    [
      'given array items is string and has item equal to default and item which is non-default',
      {
        prop1: ['something', 'somethingelse']
      },
      p1({
        type: 'array',
        items: {
          type: 'string',
          default: 'something'
        }
      }),
      {
        prop1: ['something', 'somethingelse']
      },
      {
        prop1: ['somethingelse']
      }
    ],
    [
      'given array items is object and has nested prop equal to default and another item with same prop with non-default value',
      {
        prop1: [{ prop2: 'something' }, { prop2: 'somethingelse' }]
      },
      p1({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            prop2: {
              type: 'string',
              default: 'something'
            }
          },
          additionalProperties: false
        }
      }),
      {
        prop1: [{}, { prop2: 'somethingelse' }]
      },
      {
        prop1: [{ prop2: 'somethingelse' }]
      }
    ],
    [
      'given array items is object and has nested prop equal to default and other nested prop not equal to default',
      {
        prop1: [{ prop2: 'something', prop3: 42 }, { prop2: 'somethingelse', prop3: 0 }]
      },
      p1({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            prop2: {
              type: 'string',
              default: 'something'
            },
            prop3: {
              type: 'number',
              default: 0
            }
          },
          additionalProperties: false
        }
      }),
      {
        prop1: [{ prop3: 42 }, { prop2: 'somethingelse' }]
      }
    ],
    [
      'given array items is object and has nested prop equal to default and other nested prop also equal to default',
      {
        prop1: [{ prop2: 'something', prop3: 42 }, { prop2: 'somethingelse', prop3: 0 }]
      },
      p1({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            prop2: {
              type: 'string',
              default: 'something'
            },
            prop3: {
              type: 'number',
              default: 42
            }
          },
          additionalProperties: false
        }
      }),
      {
        prop1: [{}, { prop2: 'somethingelse', prop3: 0 }]
      },
      {
        prop1: [{ prop2: 'somethingelse', prop3: 0 }]
      }
    ],
    [
      'given array items is object and has nested prop equal to default',
      {
        prop1: [{ prop2: 'something' }]
      },
      p1({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            prop2: {
              type: 'string',
              default: 'something'
            }
          },
          additionalProperties: false
        }
      }),
      {
        prop1: [{}]
      },
      {}
    ],
    [
      'given an array of booleans where the default is false',
      {
        prop1: [false, true, true, false, true, false, false]
      },
      p1({
        type: 'array',
        items: {
          type: 'boolean',
          default: false
        }
      }),
      {
        prop1: [false, true, true, false, true, false, false]
      },
      {
        prop1: [true, true, true]
      }
    ],
    [
      'given array of objects with undefined prop',
      {
        prop1: [{
          prop2: undefined
        }]
      },
      p1({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            prop2: {
              type: 'string',
              default: 'something'
            }
          },
          additionalProperties: false
        }
      }),
      {
        prop1: [{}]
      },
      {}
    ],
    [
      'given array of objects with undefined props',
      {
        prop1: [{
          prop2: undefined,
          prop3: undefined
        }]
      },
      p1({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            prop2: {
              type: 'string',
              default: 'something'
            },
            prop3: {
              type: 'string',
              default: 'something'
            }

          },
          additionalProperties: false
        }
      }),
      {
        prop1: [{}]
      },
      {}
    ],
    [
      'given array items is string and has default',
      {
        prop1: ['something']
      },
      p1({
        type: 'array',
        items: {
          type: 'string',
          default: 'something'
        }
      }),
      { prop1: ['something'] },
      {}
    ],
    [
      'given array item is untyped and has default',
      {
        prop1: ['something']
      },
      p1({
        type: 'array'
      }),
      { prop1: ['something'] }
    ],
    [
      'given array items is string and has item equal to default and item which is non-default',
      {
        prop1: ['something', 'somethingelse']
      },
      p1({
        type: 'array',
        items: {
          type: 'string',
          default: 'something'
        }
      }),
      {
        prop1: ['something', 'somethingelse']
      },
      {
        prop1: ['somethingelse']
      }
    ],
    [
      'given array items is object and has nested prop equal to default and another item with same prop with non-default value',
      {
        prop1: [{ prop2: 'something' }, { prop2: 'somethingelse' }]
      },
      p1({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            prop2: {
              type: 'string',
              default: 'something'
            }
          },
          additionalProperties: false
        }
      }),
      {
        prop1: [{}, { prop2: 'somethingelse' }]
      },
      {
        prop1: [{ prop2: 'somethingelse' }]
      }
    ],
    [
      'given array items is object and has nested prop equal to default and other nested prop not equal to default',
      {
        prop1: [{ prop2: 'something', prop3: 42 }, { prop2: 'somethingelse', prop3: 0 }]
      },
      p1({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            prop2: {
              type: 'string',
              default: 'something'
            },
            prop3: {
              type: 'number',
              default: 0
            }
          },
          additionalProperties: false
        }
      }),
      {
        prop1: [{ prop3: 42 }, { prop2: 'somethingelse' }]
      }
    ],
    [
      'given array items is object and has nested prop equal to default and other nested prop also equal to default',
      {
        prop1: [{ prop2: 'something', prop3: 42 }, { prop2: 'somethingelse', prop3: 0 }]
      },
      p1({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            prop2: {
              type: 'string',
              default: 'something'
            },
            prop3: {
              type: 'number',
              default: 42
            }
          },
          additionalProperties: false
        }
      }),
      {
        prop1: [{}, { prop2: 'somethingelse', prop3: 0 }]
      },
      {
        prop1: [{ prop2: 'somethingelse', prop3: 0 }]
      }
    ],
    [
      'given array items is object and has nested prop equal to default',
      {
        prop1: [{ prop2: 'something' }]
      },
      p1({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            prop2: {
              type: 'string',
              default: 'something'
            }
          },
          additionalProperties: false
        }
      }),
      {
        prop1: [{}]
      },
      {}
    ],
    [
      'given required prop same as default should include prop',
      {
        prop1: true
      },
      {
        ...p1({
          type: 'boolean',
          default: true
        }),
        required: ['prop1']
      },
      {
        prop1: true
      }
    ]
  ]

  describe('with reshapeArray=False', () => {
    it.each(cases)('%s', (_description, parameters, schema, expected) => {
      const result = pruneDefaults(parameters, schema)
      expect(result).toStrictEqual(expected)
    })
  })

  describe('with reshapeArray=True', () => {
    it.each(cases)('%s', (_description, parameters, schema, expectedWithoutReshape, expected) => {
      const result = pruneDefaults(parameters, schema, true)
      expect(result).toStrictEqual(expected === undefined ? expectedWithoutReshape : expected)
    })
  })

  describe('with object schema without properties', () => {
    it('should return schema unchanged', () => {
      const parameters = {
        prop1: {
          A: [1, 2, 3],
          B: [4, 5, 6]
        }
      }
      const schema = p1({
        type: 'object',
        additionalProperties: {
          type: 'array',
          items: {
            type: 'number'
          },
          uniqueItems: true
        },
        propertyNames: {
          pattern: '^[A-Z]$'
        }
      })
      const result = pruneDefaults(parameters, schema, true)
      const expected = {
        prop1: {
          A: [1, 2, 3],
          B: [4, 5, 6]
        }
      }
      expect(result).toStrictEqual(expected)
    })
  })

  describe('if/then/else', () => {
    describe('given if is true and has else parameter', () => {
      it('should remove else parameter', () => {
        const parameters = {
          prop1: 'val1',
          prop2: 'someval'
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: {
              type: 'string',
              enum: ['val1', 'val2']
            }
          },
          if: {
            properties: {
              prop1: {
                const: 'val1'
              }
            }
          },
          then: {
          },
          else: {
            properties: {
              prop2: {
                type: 'string'
              }
            }
          },
          additionalProperties: false
        }

        const result = pruneDefaults(parameters, schema, true)
        const expected = {
          prop1: 'val1'
        }
        expect(result).toStrictEqual(expected)
      })
    })

    describe('given if is false and has then parameter', () => {
      it('should remove then parameter', () => {
        const parameters = {
          prop1: 'val2',
          prop2: 'someval'
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: {
              type: 'string',
              enum: ['val1', 'val2']
            }
          },
          if: {
            properties: {
              prop1: {
                const: 'val1'
              }
            }
          },
          then: {
            properties: {
              prop2: {
                type: 'string'
              }
            }
          },
          else: {
          },
          additionalProperties: false
        }

        const result = pruneDefaults(parameters, schema, true)
        const expected = {
          prop1: 'val2'
        }
        expect(result).toStrictEqual(expected)
      })
    })

    describe('given if is true and has then and else parameter', () => {
      it('should remove else parameter, but keep then', () => {
        const parameters = {
          prop1: 'val1',
          prop2: 'someval',
          prop3: 'someval3'
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: {
              type: 'string',
              enum: ['val1', 'val2']
            }
          },
          if: {
            properties: {
              prop1: {
                const: 'val1'
              }
            }
          },
          then: {
            properties: {
              prop3: {
                type: 'string'
              }
            }
          },
          else: {
            properties: {
              prop2: {
                type: 'string'
              }
            }
          },
          additionalProperties: false
        }

        const result = pruneDefaults(parameters, schema, true)
        const expected = {
          prop1: 'val1',
          prop3: 'someval3'
        }
        expect(result).toStrictEqual(expected)
      })
    })
  })
})
