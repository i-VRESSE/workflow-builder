import { expect, describe, it, beforeEach, assert } from 'vitest'
import { JSONSchema7 } from 'json-schema'
import { UiSchema } from '@rjsf/core'
import {
  groupCatalog,
  groupParameters,
  groupSchema,
  groupUiSchema,
  unGroupParameters
} from './grouper'
import { ICatalog, IParameters } from './types'

function deepCopy<T> (value: T): T {
  return structuredClone(value)
}

describe('given a schema without any property with ui:group in uiSchema', () => {
  let schema: JSONSchema7
  let uiSchema: UiSchema
  let parameters: IParameters

  beforeEach(() => {
    schema = {
      type: 'object',
      properties: {
        prop1: {
          type: 'string'
        }
      },
      additionalProperties: false
    }
    uiSchema = {
      prop1: {
        'ui:widget': 'textarea'
      }
    }
    parameters = {
      prop1: 'val1'
    }
  })

  describe('groupSchema()', () => {
    it('should return unchanged', () => {
      const expectedSchema = deepCopy(schema)

      const groupedSchema = groupSchema(schema, uiSchema)

      expect(groupedSchema).toEqual(expectedSchema)
    })
  })

  describe('groupUiSchema()', () => {
    it('should return unchanged', () => {
      const expecteduiSchema = deepCopy(uiSchema)

      const groupedUiSchema = groupUiSchema(uiSchema)

      expect(groupedUiSchema).toEqual(expecteduiSchema)
    })
  })

  describe('groupParameters()', () => {
    it('should return unchanged', () => {
      const expectedParameters = deepCopy(parameters)

      const actual = groupParameters(parameters, uiSchema)

      expect(actual).toEqual(expectedParameters)
    })
  })

  describe('ungroupParameters()', () => {
    it('should return unchanged', () => {
      const expectedParameters = deepCopy(parameters)

      const actual = unGroupParameters(parameters, uiSchema)

      expect(actual).toEqual(expectedParameters)
    })
  })
})

describe('given a schema with a property with ui:group in uiSchema', () => {
  let schema: JSONSchema7
  let uiSchema: UiSchema
  let parameters: IParameters

  beforeEach(() => {
    schema = {
      type: 'object',
      properties: {
        prop1: {
          type: 'string'
        }
      },
      additionalProperties: false
    }
    uiSchema = {
      prop1: {
        'ui:widget': 'textarea',
        'ui:group': 'group1'
      }
    }
    parameters = {
      prop1: 'val1'
    }
  })

  describe('groupSchema()', () => {
    it('should move property inside an object with group name as key', () => {
      const groupedSchema = groupSchema(schema, uiSchema)

      const expectedSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          group1: {
            type: 'object',
            properties: {
              prop1: {
                type: 'string'
              }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
      expect(groupedSchema).toEqual(expectedSchema)
    })
  })

  describe('groupUiSchema()', () => {
    it('should move property inside an object with group name as key', () => {
      const groupedUiSchema = groupUiSchema(uiSchema)

      const expecteduiSchema: UiSchema = {
        group1: {
          'ui:field': 'collapsible',
          prop1: {
            'ui:widget': 'textarea'
          }
        }
      }
      expect(groupedUiSchema).toEqual(expecteduiSchema)
    })
  })

  describe('groupParameters()', () => {
    it('should move property inside an object with group name as key', () => {
      const actual = groupParameters(parameters, uiSchema)

      const expectedParameters = {
        group1: {
          prop1: 'val1'
        }
      }
      expect(actual).toEqual(expectedParameters)
    })
  })

  describe('unGroupParameters()', () => {
    it('should move property outside an object with group name as key', () => {
      const groupedParameters = {
        group1: {
          prop1: 'val1'
        }
      }

      const actual = unGroupParameters(groupedParameters, uiSchema)

      expect(actual).toEqual(parameters)
    })
  })
})

describe('given a schema with a 2 props with ui:group in uiSchema and 1 without', () => {
  let schema: JSONSchema7
  let uiSchema: UiSchema
  let parameters: IParameters

  beforeEach(() => {
    schema = {
      type: 'object',
      properties: {
        prop1: {
          type: 'string'
        },
        prop2: {
          type: 'string'
        },
        prop3: {
          type: 'string'
        }
      },
      additionalProperties: false
    }
    uiSchema = {
      prop1: {
        'ui:widget': 'textarea',
        'ui:group': 'group1'
      },
      prop3: {
        'ui:group': 'group1'
      }
    }
    parameters = {
      prop1: 'val1',
      prop2: 'val2',
      prop3: 'val3'
    }
  })

  describe('groupSchema()', () => {
    it('should move 2 properties inside an object with group name as key', () => {
      const groupedSchema = groupSchema(schema, uiSchema)

      const expectedSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop2: {
            type: 'string'
          },
          group1: {
            type: 'object',
            properties: {
              prop1: {
                type: 'string'
              },
              prop3: {
                type: 'string'
              }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
      expect(groupedSchema).toEqual(expectedSchema)
    })
  })

  describe('groupUiSchema()', () => {
    it('should move property inside an object with group name as key', () => {
      const groupedUiSchema = groupUiSchema(uiSchema)

      const expectedIiSchema: UiSchema = {
        group1: {
          'ui:field': 'collapsible',
          prop1: {
            'ui:widget': 'textarea'
          }
        }
      }
      expect(groupedUiSchema).toEqual(expectedIiSchema)
    })
  })

  describe('groupParameters()', () => {
    it('should move property inside an object with group name as key', () => {
      const actual = groupParameters(parameters, uiSchema)

      const expectedParameters = {
        prop2: 'val2',
        group1: {
          prop1: 'val1',
          prop3: 'val3'
        }
      }
      expect(actual).toEqual(expectedParameters)
    })
  })

  describe('unGroupParameters()', () => {
    it('should move property outside an object with group name as key', () => {
      const groupedParameters = {
        prop2: 'val2',
        group1: {
          prop1: 'val1',
          prop3: 'val3'
        }
      }

      const actual = unGroupParameters(groupedParameters, uiSchema)

      expect(actual).toEqual(parameters)
    })
  })

  describe('groupCatalog', () => {
    it('should add formSchema and update uiSchema for global and each node', () => {
      const catalog: ICatalog = {
        title: 'Test catalog',
        global: {
          schema,
          uiSchema
        },
        categories: [
          {
            name: 'category1',
            description: 'Category 1'
          }
        ],
        nodes: [
          {
            schema,
            uiSchema,
            id: 'node1',
            label: 'Node 1',
            description: 'Description 1',
            category: 'category1'
          }
        ],
        examples: {}
      }

      const actual = groupCatalog(catalog)

      const expectedSchema = {
        type: 'object',
        properties: {
          prop2: {
            type: 'string'
          },
          group1: {
            type: 'object',
            properties: {
              prop1: {
                type: 'string'
              },
              prop3: {
                type: 'string'
              }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
      const expecteduiSchema = {
        group1: {
          'ui:field': 'collapsible',
          prop1: {
            'ui:widget': 'textarea'
          }
        }
      }
      const expected = {
        title: 'Test catalog',
        global: {
          schema,
          uiSchema,
          formSchema: expectedSchema,
          formUiSchema: expecteduiSchema
        },
        categories: [
          {
            name: 'category1',
            description: 'Category 1'
          }
        ],
        nodes: [
          {
            schema,
            uiSchema,
            formSchema: expectedSchema,
            formUiSchema: expecteduiSchema,
            id: 'node1',
            label: 'Node 1',
            description: 'Description 1',
            category: 'category1'
          }
        ],
        examples: {}
      }
      expect(actual).toEqual(expected)
    })
  })
})

describe('given a schema with an object prop and no ui:group', () => {
  let schema: JSONSchema7
  let uiSchema: UiSchema
  let parameters: IParameters

  beforeEach(() => {
    schema = {
      type: 'object',
      properties: {
        prop1: {
          type: 'object',
          properties: {
            prop2: {
              type: 'string'
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    }
    uiSchema = {
      prop1: {
        prop2: {
          'ui:widget': 'textarea'
        }
      }
    }
    parameters = {
      prop1: {
        prop2: 'val1'
      }
    }
  })

  describe('groupSchema()', () => {
    it('should return unchanged', () => {
      const expectedSchema = deepCopy(schema)

      const groupedSchema = groupSchema(schema, uiSchema)

      expect(groupedSchema).toEqual(expectedSchema)
    })
  })

  describe('groupUiSchema()', () => {
    it('should return unchanged', () => {
      const expecteduiSchema = deepCopy(uiSchema)

      const groupedUiSchema = groupUiSchema(uiSchema)

      expect(groupedUiSchema).toEqual(expecteduiSchema)
    })
  })

  describe('groupParameters()', () => {
    it('should return unchanged', () => {
      const expectedParameters = deepCopy(parameters)

      const actual = groupParameters(parameters, uiSchema)

      expect(actual).toEqual(expectedParameters)
    })
  })

  describe('ungroupParameters()', () => {
    it('should return unchanged', () => {
      const expectedParameters = deepCopy(parameters)

      const actual = unGroupParameters(parameters, uiSchema)

      expect(actual).toEqual(expectedParameters)
    })
  })
})

describe('given a prop with same name as group', () => {
  describe('groupSchema()', () => {
    it('should move property inside object with same name', () => {
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
      const uiSchema: UiSchema = {
        prop1: {
          'ui:group': 'prop1'
        }
      }
      const groupedSchema = groupSchema(schema, uiSchema)

      const expectedSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'object',
            properties: {
              prop1: {
                type: 'string'
              }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
      expect(groupedSchema).toEqual(expectedSchema)
    })
  })
})

describe('given a un-grouped prop with same name as group', () => {
  describe('groupSchema()', () => {
    it('should move property inside object with same name', () => {
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'string'
          },
          prop2: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
      const uiSchema: UiSchema = {
        prop1: {
          'ui:group': 'prop2'
        }
      }

      expect(() => groupSchema(schema, uiSchema)).toThrow(
        'Can not have group and un-grouped parameter with same name prop2'
      )
    })
  })
})

describe('given a prop in own group with same name as group of another prop', () => {
  describe('groupSchema()', () => {
    it('should make 2 groups each with a prop', () => {
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          receptor_chains: {
            type: 'string'
          },
          restraints: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
      const uiSchema: UiSchema = {
        receptor_chains: {
          'ui:group': 'restraints'
        },
        restraints: {
          'ui:group': 'distance restraints'
        }
      }
      const groupedSchema = groupSchema(schema, uiSchema)

      const expectedSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          restraints: {
            type: 'object',
            properties: {
              receptor_chains: {
                type: 'string'
              }
            },
            additionalProperties: false
          },
          'distance restraints': {
            type: 'object',
            properties: {
              restraints: {
                type: 'string'
              }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
      expect(groupedSchema).toEqual(expectedSchema)
    })
  })

  describe('unGroupParameters()', () => {
    it('should work', () => {
      const groupedParameters = {
        restraints: {
          receptor_chains: 'val1'
        },
        'distance restraints': {
          restraints: 'val2'
        }
      }

      const actual = unGroupParameters(groupedParameters, {
        receptor_chains: {
          'ui:group': 'restraints'
        },
        restraints: {
          'ui:group': 'distance restraints'
        }
      })

      const expectedParameters = {
        receptor_chains: 'val1',
        restraints: 'val2'
      }
      expect(actual).toEqual(expectedParameters)
    })
  })
})

describe('given a prop with same name as group and another prop in same group', () => {
  describe('groupSchema()', () => {
    it('should move property inside object with same name', () => {
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'string'
          },
          prop2: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
      const uiSchema: UiSchema = {
        prop1: {
          'ui:group': 'prop1'
        },
        prop2: {
          'ui:group': 'prop1'
        }
      }
      const groupedSchema = groupSchema(schema, uiSchema)

      const expectedSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'object',
            properties: {
              prop1: {
                type: 'string'
              },
              prop2: {
                type: 'string'
              }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
      expect(groupedSchema).toEqual(expectedSchema)
    })
  })
})

describe('given a schema with if/then/else', () => {
  let schema: JSONSchema7
  let uiSchema: UiSchema

  describe('else in same group', () => {
    beforeEach(() => {
      schema = {
        type: 'object',
        properties: {
          prop1: {
            type: 'string',
            enum: ['val1', 'val2']
          }
        },
        additionalProperties: false,
        if: {
          properties: {
            prop1: {
              const: 'val1'
            }
          }
        },
        then: {},
        else: {
          properties: {
            prop2: {
              type: 'string'
            }
          }
        }
      }
      uiSchema = {
        prop1: {
          'ui:group': 'group1'
        },
        prop2: {
          'ui:group': 'group1'
        }
      }
    })

    describe('groupSchema()', () => {
      it('should move properties inside an object with group name as key', () => {
        const groupedSchema = groupSchema(schema, uiSchema)

        const expectedSchema: JSONSchema7 = {
          type: 'object',
          properties: {
            group1: {
              type: 'object',
              properties: {
                prop1: {
                  type: 'string',
                  enum: ['val1', 'val2']
                }
              },
              additionalProperties: false,
              if: {
                properties: {
                  prop1: {
                    const: 'val1'
                  }
                }
              },
              then: {},
              else: {
                properties: {
                  prop2: {
                    type: 'string'
                  }
                }
              }
            }
          },
          additionalProperties: false
        }
        expect(groupedSchema).toEqual(expectedSchema)
      })
    })
  })

  describe('then in same group', () => {
    beforeEach(() => {
      schema = {
        type: 'object',
        properties: {
          prop1: {
            type: 'string',
            enum: ['val1', 'val2']
          }
        },
        additionalProperties: false,
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
        else: {}
      }
      uiSchema = {
        prop1: {
          'ui:group': 'group1'
        },
        prop2: {
          'ui:group': 'group1'
        }
      }
    })

    describe('groupSchema()', () => {
      it('should move properties inside an object with group name as key', () => {
        const groupedSchema = groupSchema(schema, uiSchema)

        const expectedSchema: JSONSchema7 = {
          type: 'object',
          properties: {
            group1: {
              type: 'object',
              properties: {
                prop1: {
                  type: 'string',
                  enum: ['val1', 'val2']
                }
              },
              additionalProperties: false,
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
              else: {}
            }
          },
          additionalProperties: false
        }
        expect(groupedSchema).toEqual(expectedSchema)
      })
    })
  })

  describe.each<{ label: string, schema: JSONSchema7, uiSchema: UiSchema }>([
    {
      label: 'if and else in different group',
      schema: {
        type: 'object',
        properties: {
          prop1: {
            type: 'string',
            enum: ['val1', 'val2']
          }
        },
        additionalProperties: false,
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
        }
      },
      uiSchema: {
        prop1: {
          'ui:group': 'group1'
        },
        prop2: {
          'ui:group': 'group2'
        }
      }
    },
    {
      label: 'if and then in different group',
      schema: {
        type: 'object',
        properties: {
          prop1: {
            type: 'string',
            enum: ['val1', 'val2']
          }
        },
        additionalProperties: false,
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
        else: {}
      },
      uiSchema: {
        prop1: {
          'ui:group': 'group1'
        },
        prop2: {
          'ui:group': 'group2'
        }
      }
    },
    {
      label: 'if not in group',
      schema: {
        type: 'object',
        properties: {
          prop1: {
            type: 'string',
            enum: ['val1', 'val2']
          }
        },
        additionalProperties: false,
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
        else: {}
      },
      uiSchema: {
        prop2: {
          'ui:group': 'group2'
        }
      }
    }
  ])('$label', ({ schema, uiSchema }) => {
    it('groupSchema() should throw error', () => {
      assert.throws(() => {
        groupSchema(schema, uiSchema)
      }, 'Cannot have an if in one group and a then/else in another group')
    })
  })
})
