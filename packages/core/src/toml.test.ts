import dedent from 'ts-dedent'
import { expect, describe, it, beforeEach } from 'vitest'
import { dedupWorkflow, parseWorkflowByCatalogPieces, TomlSchemas, workflow2tomltext, tomlstring2table, parseWorkflow, lines2node } from './toml'
import { ICatalog, IParameters } from './types'

describe('workflow2tomltext()', () => {
  it('should write list of dicts as array of tables', () => {
    const nodes = [{
      type: 'somenode',
      parameters: {
        foo: [{
          bar: 'fiz'
        }, {
          bar: 'fizzz'
        }]
      },
      id: 'somenode1'
    }]

    const tomlSchemas = {
      nodes: {
        somenode: {
          foo: {
            items: {
              sectioned: true
            }
          }
        }
      },
      global: {}
    }

    const result = workflow2tomltext(nodes, {}, tomlSchemas)
    const expected = `
[somenode]

[[somenode.foo]]

bar = 'fiz'

[[somenode.foo]]

bar = 'fizzz'
`
    expect(result).toEqual(expected)
  })

  it('should index repeated nodes', () => {
    const nodes = [
      {
        type: 'somenode',
        parameters: {
          foo: 'bar'
        },
        id: 'somenode1'
      },
      {
        type: 'somenode',
        parameters: {
          foo: 'fizz'
        },
        id: 'somenode2'
      }
    ]
    const tomlSchemas: TomlSchemas = { nodes: {}, global: {} }
    const result = workflow2tomltext(nodes, {}, tomlSchemas)
    const expected = `
[somenode]

foo = 'bar'

['somenode.2']

foo = 'fizz'
`
    expect(result).toEqual(expected)
  })

  it('should flatten array of string when indexed=true', () => {
    const nodes = [{
      type: 'somenode',
      parameters: {
        foo: ['biz', 'fiz']
      },
      id: 'somenode1'
    }]
    const tomlSchemas: TomlSchemas = {
      nodes: {
        somenode: {
          foo: { indexed: true }
        }
      },
      global: {}
    }
    const result = workflow2tomltext(nodes, {}, tomlSchemas)
    const expected = `
[somenode]

foo_1 = 'biz'
foo_2 = 'fiz'
`
    expect(result).toEqual(expected)
  })

  it('should flatten array of object when indexed=true items.flatten=true', () => {
    const nodes = [{
      type: 'somenode',
      parameters: {
        name: [{
          something: 11,
          something_else: 22
        }, {
          something: 33,
          something_else: 44
        }]
      },
      id: 'somenode1'
    }]
    const tomlSchemas: TomlSchemas = {
      nodes: {
        somenode: {
          name: { indexed: true, items: { flatten: true } }
        }
      },
      global: {}
    }
    const result = workflow2tomltext(nodes, {}, tomlSchemas)
    const expected = `
[somenode]

name_something_1 = 11
name_something_else_1 = 22
name_something_2 = 33
name_something_else_2 = 44
`
    expect(result).toEqual(expected)
  })

  it('should flatten array of array of objects when indexed=true items.indexed=true items.items.flatten=true', () => {
    const nodes = [{
      type: 'somenode',
      parameters: {
        fle: [
          [
            {
              sta: 11,
              end: 22
            },
            {
              sta: 33,
              end: 44
            }
          ],
          [
            {
              sta: 55,
              end: 66
            }
          ]
        ]
      },
      id: 'somenode1'
    }]
    const tomlSchemas: TomlSchemas = {
      nodes: {
        somenode: {
          fle: { indexed: true, items: { indexed: true, items: { flatten: true } } }
        }
      },
      global: {}
    }
    const result = workflow2tomltext(nodes, {}, tomlSchemas)
    const expected = `
[somenode]

fle_sta_1_1 = 11
fle_end_1_1 = 22
fle_sta_1_2 = 33
fle_end_1_2 = 44
fle_sta_2_1 = 55
fle_end_2_1 = 66
`
    expect(result).toEqual(expected)
  })

  it('should output section table when sectioned:true', () => {
    const nodes = [{
      type: 'somenode',
      parameters: {
        mol: [{
          cyclicpept: false,
          hisd: [13, 42]
        }, {
          cyclicpept: true,
          hisd: [314, 512]
        }]
      },
      id: 'somenode1'
    }]
    const tomlSchemas: TomlSchemas = {
      nodes: {
        somenode: {
          mol: {
            indexed: true,
            items: {
              sectioned: true,
              properties: {
                hisd: {
                  indexed: true
                }
              }
            }
          }
        }
      },
      global: {}
    }
    const result = workflow2tomltext(nodes, {}, tomlSchemas)
    const expected = `
[somenode]

[somenode.mol1]

cyclicpept = false
hisd_1 = 13
hisd_2 = 42

[somenode.mol2]

cyclicpept = true
hisd_1 = 314
hisd_2 = 512
`
    expect(result).toEqual(expected)
  })

  it('should use complex values by default', () => {
    const globalParameters: IParameters = {
      key1: [1, 2], // Array of scalar
      key2: ['a', 'b'], // Array of scalar
      key3: { a: 1, b: 2 }, // Object
      key4: { a: [1, 2] }, // Object with array of scalar
      key5: [{ a: 1 }, { a: 2 }], // Array with objects
      key6: [{ a: [1, 2] }], // Array with oboject with array of scalar
      key7: [[1, 2], [3, 4]], // Array of array of scalar
      key8: [[{ a: 1 }, { a: 2 }], [{ a: 3 }, { a: 4 }]] // Array of array of object
    }
    const tomlSchemas: TomlSchemas = { nodes: {}, global: {} }
    const result = workflow2tomltext([], globalParameters, tomlSchemas)
    const expected = `
key1 = [
  1,
  2,
]

key2 = [
  'a',
  'b',
]

key3.a = 1
key3.b = 2
key4.a = [
  1,
  2,
]

key5 = [
  { a = 1 },
  { a = 2 },
]

key6 = [
  { a = [
    1,
    2,
  ] },
]

key7 = [
  [
    1,
    2,
  ],
  [
    3,
    4,
  ],
]

key8 = [
  [
    { a = 1 },
    { a = 2 },
  ],
  [
    { a = 3 },
    { a = 4 },
  ],
]

`
    expect(result).toEqual(expected)
  })

  it('should write object of object as section when sectioned:true', () => {
    const nodes = [
      {
        type: 'somenode',
        parameters: {
          foo: {
            bar: {
              bla: 'hi'
            }
          }
        },
        id: 'somenode1'
      }
    ]
    const tomlSchemas: TomlSchemas = {
      nodes: {
        somenode: {
          foo: {
            sectioned: true
          }
        }
      },
      global: {}
    }

    const result = workflow2tomltext(nodes, {}, tomlSchemas)
    const expected = `
[somenode]

[somenode.foo]

bar.bla = 'hi'
`
    expect(result).toEqual(expected)
  })

  it('should output <param>_<key> when given object and indexed=true', () => {
    const nodes = [{
      type: 'somenode',
      parameters: {
        param: {
          A: 11,
          B: 22,
          C: 33
        }
      },
      id: 'somenode1'
    }]
    const tomlSchemas = {
      nodes: {
        somenode: {
          param: {
            indexed: true
          }
        }
      },
      global: {}
    }
    const result = workflow2tomltext(nodes, {}, tomlSchemas)
    const expected = `
[somenode]

param_A = 11
param_B = 22
param_C = 33
`
    expect(result).toEqual(expected)
  })
})

describe('parseWorkflowByCatalogPieces()', () => {
  it('should divide global and module parameters', () => {
    const workflow = `
myglobalvar = 'something'

[somenode]

foo = 'bar'
`
    const globalKeys = new Set(['myglobalvar'])
    const result = parseWorkflowByCatalogPieces(tomlstring2table(workflow), globalKeys, {}, {})
    const expected = {
      global: {
        myglobalvar: 'something'
      },
      nodes: [
        {
          type: 'somenode',
          parameters: {
            foo: 'bar'
          },
          id: expect.stringMatching(/\w+/)
        }
      ]
    }
    expect(result).toEqual(expected)
  })

  it('should de-index repeated nodes', () => {
    const workflow = `
[somenode]

foo = 'bar'

['somenode.2']

foo = 'fizz'
`
    const result = parseWorkflowByCatalogPieces(
      tomlstring2table(workflow), new Set(), {}, {})
    const expected = {
      global: {},
      nodes: [
        {
          type: 'somenode',
          parameters: {
            foo: 'bar'
          },
          id: expect.stringMatching(/\w+/)
        },
        {
          type: 'somenode',
          parameters: {
            foo: 'fizz'
          },
          id: expect.stringMatching(/\w+/)
        }
      ]
    }
    expect(result).toEqual(expected)
  })

  it('should read complex values by default', () => {
    const workflow = `
key1 = [
  1,
  2,
]
key2 = [
  'a',
  'b',
]
key3.a = 1
key3.b = 2
key4.a = [
  1,
  2,
]
key5 = [
  { a = 1 },
  { a = 2 },
]
key6 = [
  { a = [
    1,
    2,
  ] },
]
key7 = [
  [
    1,
    2,
  ],
  [
    3,
    4,
  ],
]
key8 = [
  [
    { a = 1 },
    { a = 2 },
  ],
  [
    { a = 3 },
    { a = 4 },
  ],
]

[somenode]
key1 = [
  1,
  2,
]
key2 = [
  'a',
  'b',
]
key3.a = 1
key3.b = 2
key4.a = [
  1,
  2,
]
key5 = [
  { a = 1 },
  { a = 2 },
]
key6 = [
  { a = [
    1,
    2,
  ] },
]
key7 = [
  [
    1,
    2,
  ],
  [
    3,
    4,
  ],
]
key8 = [
  [
    { a = 1 },
    { a = 2 },
  ],
  [
    { a = 3 },
    { a = 4 },
  ],
]
`
    const expected = {
      global: {
        key1: [1, 2], // Array of scalar
        key2: ['a', 'b'], // Array of scalar
        key3: { a: 1, b: 2 }, // Object
        key4: { a: [1, 2] }, // Object with array of scalar
        key5: [{ a: 1 }, { a: 2 }], // Array with objects
        key6: [{ a: [1, 2] }], // Array with oboject with array of scalar
        key7: [[1, 2], [3, 4]], // Array of array of scalar
        key8: [[{ a: 1 }, { a: 2 }], [{ a: 3 }, { a: 4 }]] // Array of array of object
      },
      nodes: [{
        type: 'somenode',
        parameters: {
          key1: [1, 2], // Array of scalar
          key2: ['a', 'b'], // Array of scalar
          key3: { a: 1, b: 2 }, // Object
          key4: { a: [1, 2] }, // Object with array of scalar
          key5: [{ a: 1 }, { a: 2 }], // Array with objects
          key6: [{ a: [1, 2] }], // Array with oboject with array of scalar
          key7: [[1, 2], [3, 4]], // Array of array of scalar
          key8: [[{ a: 1 }, { a: 2 }], [{ a: 3 }, { a: 4 }]] // Array of array of object
        },
        id: expect.stringMatching(/\w+/)
      }]
    }
    const result = parseWorkflowByCatalogPieces(tomlstring2table(workflow), new Set(Object.keys(expected.global)), {}, {})
    expect(result).toEqual(expected)
  })

  describe('given global parameters', () => {
    it('should read array of tables as array of objects', () => {
      const workflow = `
  [[foo]]
  bar = 'fizz'
  `
      const result = parseWorkflowByCatalogPieces(tomlstring2table(workflow), new Set(['foo']), {}, {})
      const expected = {
        global: {
          foo: [{
            bar: 'fizz'
          }]
        },
        nodes: []
      }
      expect(result).toEqual(expected)
    })

    it('should expand to array of string when global and indexed=true', () => {
      const workflow = `
  foo_1 = 'biz'
  foo_2 = 'fiz'
  `
      const tomlSchema4global = {
        foo: { indexed: true }
      }
      const tomSchema4nodes = {}

      const result = parseWorkflowByCatalogPieces(
        tomlstring2table(workflow),
        new Set(['foo']),
        tomlSchema4global,
        tomSchema4nodes
      )

      const expected = {
        foo: ['biz', 'fiz']
      }
      expect(result.global).toEqual(expected)
    })

    it('should expand to array of objects when global and indexed:true + flatten:true', () => {
      const workflow = `
  foo_something_1 = 11
  foo_else_1 = 22
  foo_something_2 = 33
  foo_else_2 = 44
      `
      const tomlSchema4global = {
        foo: { indexed: true, items: { flatten: true } }
      }
      const tomlSchema4nodes = {}

      const result = parseWorkflowByCatalogPieces(
        tomlstring2table(workflow),
        new Set(['foo']),
        tomlSchema4global,
        tomlSchema4nodes
      )

      const expected = {
        foo: [{
          something: 11,
          else: 22
        }, {
          something: 33,
          else: 44
        }]
      }
      expect(result.global).toEqual(expected)
    })

    it('should expand to array of array of object whend global and 2x indexed:true + flatten:true', () => {
      const workflow = `
  fle_sta_1_1 = 11
  fle_end_1_1 = 22
  fle_sta_1_2 = 33
  fle_end_1_2 = 44
  fle_sta_2_1 = 55
  fle_end_2_1 = 66
      `
      const tomlSchema4global = {
        fle: { indexed: true, items: { indexed: true, items: { flatten: true } } }
      }
      const tomSchema4nodes = {}

      const result = parseWorkflowByCatalogPieces(
        tomlstring2table(workflow),
        new Set(['fle']),
        tomlSchema4global,
        tomSchema4nodes
      )

      const expected = {
        fle: [
          [
            {
              sta: 11,
              end: 22
            },
            {
              sta: 33,
              end: 44
            }
          ],
          [
            {
              sta: 55,
              end: 66
            }
          ]
        ]
      }
      expect(result.global).toEqual(expected)
    })

    it('should expand to array of objects when indexed:true + sectioned:true', () => {
      const workflow = `
  [mol_1]

  cyclicpept = false

  [mol_2]

  cyclicpept = true
  `
      const tomlSchema4global = {
        mol: {
          indexed: true,
          items: {
            sectioned: true
          }
        }
      }
      const tomSchema4nodes = {}

      const result = parseWorkflowByCatalogPieces(
        tomlstring2table(workflow),
        new Set(['mol']),
        tomlSchema4global,
        tomSchema4nodes
      )

      const expected = {
        mol: [{
          cyclicpept: false
        }, {
          cyclicpept: true
        }]
      }
      expect(result.global).toEqual(expected)
    })

    it('should expand to array of objects when indexed:true + sectioned:true + prop indexed', () => {
      const workflow = `
  [mol1]

  hisd_1 = 13
  hisd_2 = 42

  [mol2]

  hisd_1 = 314
  hisd_2 = 512
  `
      const tomlSchema4global = {
        mol: {
          indexed: true,
          items: {
            sectioned: true,
            properties: {
              hisd: {
                indexed: true
              }
            }
          }
        }
      }
      const tomSchema4nodes = {}

      const result = parseWorkflowByCatalogPieces(
        tomlstring2table(workflow),
        new Set(['mol']),
        tomlSchema4global,
        tomSchema4nodes
      )

      const expected = {
        mol: [{
          hisd: [13, 42]
        }, {
          hisd: [314, 512]
        }]
      }
      expect(result.global).toEqual(expected)
    })

    it('should expand to array of objects when indexed:true + sectioned:true', () => {
      const workflow = `
      [nodex.mol1]
      cyclicpept = true

      [nodex.mol2]
      cyclicpept = false
      `
      const tomlSchema4global = {}
      const tomSchema4nodes = {
        nodex: {
          mol: {
            indexed: true,
            items: {
              sectioned: true
            }
          }
        }
      }

      const result = parseWorkflowByCatalogPieces(
        tomlstring2table(workflow),
        new Set(),
        tomlSchema4global,
        tomSchema4nodes
      )

      const expected = {
        type: 'nodex',
        parameters: {
          mol: [{
            cyclicpept: true
          }, {
            cyclicpept: false
          }]
        },
        id: expect.stringMatching(/\w+/)
      }
      expect(result.nodes[0]).toEqual(expected)
    })

    it('should expand to array of array of object whend global and 2x indexed:true + flatten:true', () => {
      const workflow = `
  fle_sta_1_1 = 11
  fle_end_1_1 = 22
  fle_sta_1_2 = 33
  fle_end_1_2 = 44
  fle_sta_2_1 = 55
  fle_end_2_1 = 66
      `
      const tomlSchema4global = {
        fle: { indexed: true, items: { indexed: true, items: { flatten: true } } }
      }
      const tomSchema4nodes = {}

      const result = parseWorkflowByCatalogPieces(
        tomlstring2table(workflow),
        new Set(['fle']),
        tomlSchema4global,
        tomSchema4nodes
      )

      const expected = {
        fle: [
          [
            {
              sta: 11,
              end: 22
            },
            {
              sta: 33,
              end: 44
            }
          ],
          [
            {
              sta: 55,
              end: 66
            }
          ]
        ]
      }
      expect(result.global).toEqual(expected)
    })

    it('should read "foo_bar=val" as {foo: {bar: "val"}} when indexed:true', () => {
      const workflow = dedent`
          foo_bar = "val"
          `
      const tomlSchema4global = {
        foo: { indexed: true }
      }
      const tomlSchema4nodes = {}

      const result = parseWorkflowByCatalogPieces(
        tomlstring2table(workflow),
        new Set(['foo']),
        tomlSchema4global,
        tomlSchema4nodes
      )

      const expected = {
        foo: {
          bar: 'val'
        }
      }
      expect(result.global).toEqual(expected)
    })
  })

  describe('give a node with tomlSchema', () => {
    it('should read array of tables as array of objects', () => {
      const workflow = `
  [[somenode.foo]]
  bar = 'fizz'
  `
      const result = parseWorkflowByCatalogPieces(tomlstring2table(workflow), new Set(), {}, {})
      const expected = {
        global: {},
        nodes: [{
          type: 'somenode',
          parameters: {
            foo: [{
              bar: 'fizz'
            }]
          },
          id: expect.stringMatching(/\w+/)
        }]
      }
      expect(result).toEqual(expected)
    })

    it('should expand to array of string when global and indexed=true', () => {
      const workflow = `
  [somenode]
  foo_1 = 'biz'
  foo_2 = 'fiz'
  `
      const tomlSchema4global = {}
      const tomSchema4nodes = {
        somenode: {
          foo: { indexed: true }
        }
      }

      const result = parseWorkflowByCatalogPieces(
        tomlstring2table(workflow),
        new Set(),
        tomlSchema4global,
        tomSchema4nodes
      )

      const expected = {
        global: {},
        nodes: [{
          type: 'somenode',
          parameters: {
            foo: ['biz', 'fiz']
          },
          id: expect.stringMatching(/\w+/)
        }]
      }
      expect(result).toEqual(expected)
    })
  })
})

describe('dedupWorkflow()', () => {
  it.each([
    [
      'no dups',
      `\
[somenode]
foo = 42

[somenode.nestedpar]
bar = 5

['somenode.1']

['somenode.1'.nestedpar]
bar = 8
`,
`\
[somenode]
foo = 42

[somenode.nestedpar]
bar = 5

['somenode.1']

['somenode.1'.nestedpar]
bar = 8
`
    ], [
      'simple dups',
      `\
[somenode]
foo = 1

[somenode]
foo = 2
`, `\
[somenode]
foo = 1

['somenode.1']
foo = 2
`
    ], [
      'nested dups',
  `\
[somenode]
foo = 1

[somenode.nestedpar]
bar = 2

[somenode]
foo = 3

[somenode.nestedpar]
bar = 4
`, `\
[somenode]
foo = 1

[somenode.nestedpar]
bar = 2

['somenode.1']
foo = 3

['somenode.1'.nestedpar]
bar = 4
`
    ]
  ])('given %s should replace repeated headers with headers including an index', (_desc, input, expected) => {
    const actual = dedupWorkflow(input)
    expect(actual).toEqual(expected)
  })
})

describe('parseWorkflow()', () => {
  describe('given calalog with if then else block', () => {
    let catalog: ICatalog

    beforeEach(() => {
      catalog = {
        title: 'test',
        categories: [],
        examples: {},
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
          uiSchema: {}
        },
        nodes: []
      }
    })

    it('should have parameters from block be global parameters', () => {
      const workflow = `
         thenpar = 42
         elsepar = 113
         `

      const result = parseWorkflow(workflow, catalog)

      const expected = {
        global: {
          thenpar: 42,
          elsepar: 113
        },
        nodes: []
      }

      expect(result).toEqual(expected)
    })
  })
})

describe('lines2node()', () => {
  it('given just global parameters should return all lines -1', () => {
    const workflow = [
      '',
      'molecules = [',
      ']',
      ''
    ].join('\n')

    const lookup = lines2node(workflow)

    const expected = [-1, -1, -1, -1, -1]
    expect(lookup).toEqual(expected)
  })

  it('given one section', () => {
    const workflow = [
      '',
      'molecules = [',
      ']',
      '',
      '[section1]'
    ].join('\n')

    const lookup = lines2node(workflow)

    const expected = [-1, -1, -1, -1, -1, 0]
    expect(lookup).toEqual(expected)
  })

  it('given 2 sections', () => {
    const workflow = [
      '',
      'molecules = [',
      ']',
      '',
      '[section1]',
      '',
      '[section2]'
    ].join('\n')

    const lookup = lines2node(workflow)

    const expected = [-1, -1, -1, -1, -1, 0, 0, 1]
    expect(lookup).toEqual(expected)
  })

  it('given 2 sections', () => {
    const workflow = [
      '',
      'molecules = [',
      ']',
      '',
      '[section1]',
      '',
      '[section1.mol1]'
    ].join('\n')

    const lookup = lines2node(workflow)

    const expected = [-1, -1, -1, -1, -1, 0, 0, 0]
    expect(lookup).toEqual(expected)
  })
})
