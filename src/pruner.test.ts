import { expect, describe, it } from 'vitest'
import { JSONSchema7 } from 'json-schema'
import { pruneDefaults } from './pruner'

describe('pruneDefaults()', () => {
  describe('given empty parameters', () => {
    it('should return unchanged', () => {
      const parameters = {}
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {},
        additionalProperties: false
      }

      const result = pruneDefaults(parameters, schema)

      expect(result).toEqual(parameters)
    })
  })

  describe('given parameters which has no default', () => {
    it('should return unchanged', () => {
      const parameters = {
        prop1: 'something'
      }
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'string'
          }
        },
        additionalProperties: false
      }

      const result = pruneDefaults(parameters, schema)

      expect(result).toEqual(parameters)
    })
  })

  describe('given parameters which is set to non-default', () => {
    it('should return unchanged', () => {
      const parameters = {
        prop1: 'something'
      }
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'string',
            default: 'somethingelse'
          }
        },
        additionalProperties: false
      }

      const result = pruneDefaults(parameters, schema)

      expect(result).toEqual(parameters)
    })
  })

  describe('given a string and is set to default', () => {
    it('should not include prop', () => {
      const parameters = {
        prop1: 'something'
      }
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'string',
            default: 'something'
          }
        },
        additionalProperties: false
      }

      const result = pruneDefaults(parameters, schema)

      const expected = {}
      expect(result).toEqual(expected)
    })
  })

  describe('given an empty string and is set to default', () => {
    it('should not include prop', () => {
      const parameters = {
        prop1: ''
      }
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'string',
            default: ''
          }
        },
        additionalProperties: false
      }

      const result = pruneDefaults(parameters, schema)

      const expected = {}
      expect(result).toEqual(expected)
    })
  })

  describe('given an empty string and default is something', () => {
    it('should include prop', () => {
      const parameters = {
        prop1: ''
      }
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'string',
            default: 'something'
          }
        },
        additionalProperties: false
      }

      const result = pruneDefaults(parameters, schema)

      const expected = {
        prop1: ''
      }
      expect(result).toEqual(expected)
    })
  })

  describe('given a integer and is set to default', () => {
    it('should not include prop', () => {
      const parameters = {
        prop1: 8
      }
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'number',
            default: 8
          }
        },
        additionalProperties: false
      }

      const result = pruneDefaults(parameters, schema)

      const expected = {}
      expect(result).toEqual(expected)
    })
  })

  describe('given a float and is set to default', () => {
    it('should not include prop', () => {
      const parameters = {
        prop1: 3.14
      }
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'number',
            default: 3.14
          }
        },
        additionalProperties: false
      }

      const result = pruneDefaults(parameters, schema)

      const expected = {}
      expect(result).toEqual(expected)
    })
  })

  describe('given false and is set to default', () => {
    it('should not include prop', () => {
      const parameters = {
        prop1: false
      }
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'boolean',
            default: false
          }
        },
        additionalProperties: false
      }

      const result = pruneDefaults(parameters, schema)

      const expected = {}
      expect(result).toEqual(expected)
    })
  })

  describe('given true and is set to default', () => {
    it('should not include prop', () => {
      const parameters = {
        prop1: true
      }
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'boolean',
            default: true
          }
        },
        additionalProperties: false
      }

      const result = pruneDefaults(parameters, schema)

      const expected = {}
      expect(result).toEqual(expected)
    })
  })

  describe('given prop inside object is set to default', () => {
    it('should not include object', () => {
      const parameters = {
        prop1: {
          prop2: 'something'
        }
      }
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'object',
            properties: {
              prop2: {
                type: 'string',
                default: 'something'
              }
            }
          }
        },
        additionalProperties: false
      }

      const result = pruneDefaults(parameters, schema)

      const expected = {}
      expect(result).toEqual(expected)
    })
  })

  describe('given prop is set to default and second prop without default', () => {
    it('should not include object', () => {
      const parameters = {
        prop1: 'something',
        prop2: 42
      }
      const schema: JSONSchema7 = {
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
      }

      const result = pruneDefaults(parameters, schema)

      const expected = {
        prop2: 42
      }
      expect(result).toEqual(expected)
    })
  })

  describe('given [] and is set to default', () => {
    it('should not include prop', () => {
      const parameters = {
        prop1: []
      }
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
            type: 'array',
            default: []
          }
        },
        additionalProperties: false
      }

      const result = pruneDefaults(parameters, schema)

      const expected = {}
      expect(result).toEqual(expected)
    })
  })

  describe('given prop inside object is set to default and second prop inside object', () => {
    it('should not include object', () => {
      const parameters = {
        prop1: {
          prop2: 'something',
          prop3: 42
        }
      }
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: {
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
          }
        },
        additionalProperties: false
      }

      const result = pruneDefaults(parameters, schema)

      const expected = {
        prop1: {
          prop3: 42
        }
      }
      expect(result).toEqual(expected)
    })
  })
})

describe('given array items is string and has default', () => {
  it('should not include prop', () => {
    const parameters = {
      prop1: ['something']
    }
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        prop1: {
          type: 'array',
          items: {
            type: 'string',
            default: 'something'
          }
        }
      },
      additionalProperties: false
    }

    const result = pruneDefaults(parameters, schema)

    const expected = {}
    expect(result).toEqual(expected)
  })
})

describe('given array item is untyped and has default', () => {
  it('should include prop', () => {
    const parameters = {
      prop1: ['something']
    }
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        prop1: {
          type: 'array'
        }
      },
      additionalProperties: false
    }

    const result = pruneDefaults(parameters, schema)

    const expected = {
      prop1: ['something']
    }
    expect(result).toEqual(expected)
  })
})

describe('given array items is string and has item equal to default and item which is non-default', () => {
  it('should not include prop', () => {
    const parameters = {
      prop1: ['something', 'somethingelse']
    }
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        prop1: {
          type: 'array',
          items: {
            type: 'string',
            default: 'something'
          }
        }
      },
      additionalProperties: false
    }

    const result = pruneDefaults(parameters, schema)

    const expected = {
      prop1: ['somethingelse']
    }
    expect(result).toEqual(expected)
  })
})

describe('given array items is object and has nested prop equal to default and another item with same prop with non-default value', () => {
  it('should not include prop', () => {
    const parameters = {
      prop1: [{ prop2: 'something' }, { prop2: 'somethingelse' }]
    }
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        prop1: {
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
        }
      },
      additionalProperties: false
    }

    const result = pruneDefaults(parameters, schema)

    const expected = {
      prop1: [{ prop2: 'somethingelse' }]
    }
    expect(result).toEqual(expected)
  })
})

describe('given array items is object and has nested prop equal to default and other nested prop not equal to default', () => {
  it('should not include prop', () => {
    const parameters = {
      prop1: [{ prop2: 'something', prop3: 42 }, { prop2: 'somethingelse', prop3: 0 }]
    }
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        prop1: {
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
        }
      },
      additionalProperties: false
    }

    const result = pruneDefaults(parameters, schema)

    const expected = {
      prop1: [{ prop3: 42 }, { prop2: 'somethingelse' }]
    }
    expect(result).toEqual(expected)
  })
})

describe('given array items is object and has nested prop equal to default and other nested prop also equal to default', () => {
  it('should not include prop', () => {
    const parameters = {
      prop1: [{ prop2: 'something', prop3: 42 }, { prop2: 'somethingelse', prop3: 0 }]
    }
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        prop1: {
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
        }
      },
      additionalProperties: false
    }

    const result = pruneDefaults(parameters, schema)

    const expected = {
      prop1: [{ prop2: 'somethingelse', prop3: 0 }]
    }
    expect(result).toEqual(expected)
  })
})

describe('given array items is object and has nested prop equal to default', () => {
  it('should not include prop', () => {
    const parameters = {
      prop1: [{ prop2: 'something' }]
    }
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        prop1: {
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
        }
      },
      additionalProperties: false
    }

    const result = pruneDefaults(parameters, schema)

    const expected = {}
    expect(result).toEqual(expected)
  })
})
