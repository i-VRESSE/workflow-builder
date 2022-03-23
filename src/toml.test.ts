import { expect, describe, it } from 'vitest'
import dedent from 'ts-dedent'
import { parseWorkflow, workflow2tomltext } from './toml'
import { IParameters, TomlScalarSchema } from './types'

describe('workflow2tomltext()', () => {
  it('should write list of dicts as array of tables', () => {
    const nodes = [{
      id: 'somenode',
      parameters: {
        foo: [{
          bar: 'fiz'
        }, {
          bar: 'fizzz'
        }]
      }
    }]

    const tomlSchema = {
      somenode: {
        foo: {
          items: {
            sectioned: true
          }
        }
      }
    }

    const result = workflow2tomltext(nodes, {}, tomlSchema)
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
        id: 'somenode',
        parameters: {
          foo: 'bar'
        }
      },
      {
        id: 'somenode',
        parameters: {
          foo: 'fizz'
        }
      }
    ]

    const result = workflow2tomltext(nodes, {})
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
      id: 'somenode',
      parameters: {
        foo: ['biz', 'fiz']
      }
    }]
    const tomlSchema4nodes = {
      somenode: {
        foo: { indexed: true }
      }
    }
    const tomlSchema4global = {}
    const result = workflow2tomltext(nodes, {}, tomlSchema4nodes, tomlSchema4global)
    const expected = `
[somenode]

foo_1 = 'biz'
foo_2 = 'fiz'
`
    expect(result).toEqual(expected)
  })

  it('should flatten array of object when indexed=true items.flatten=true', () => {
    const nodes = [{
      id: 'somenode',
      parameters: {
        name: [{
          something: 11,
          something_else: 22
        }, {
          something: 33,
          something_else: 44
        }]
      }
    }]
    const tomlSchema4nodes = {
      somenode: {
        name: { indexed: true, items: { flatten: true } }
      }
    }
    const tomlSchema4global = {}
    const result = workflow2tomltext(nodes, {}, tomlSchema4nodes, tomlSchema4global)
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
      id: 'somenode',
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
      }
    }]
    const tomlSchema4nodes = {
      somenode: {
        fle: { indexed: true, items: { indexed: true, items: { flatten: true } } }
      }
    }
    const tomlSchema4global = {}
    const result = workflow2tomltext(nodes, {}, tomlSchema4nodes, tomlSchema4global)
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
      id: 'somenode',
      parameters: {
        mol: [{
          cyclicpept: false,
          hisd: [13, 42]
        }, {
          cyclicpept: true,
          hisd: [314, 512]
        }]
      }
    }]
    const tomlSchema4nodes = {
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
    }
    const tomlSchema4global = {}
    const result = workflow2tomltext(nodes, {}, tomlSchema4nodes, tomlSchema4global)
    const expected = `
[somenode]

[somenode.mol_1]

cyclicpept = false
hisd_1 = 13
hisd_2 = 42

[somenode.mol_2]

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
    const tomlSchema = {}
    const result = workflow2tomltext([], globalParameters, {}, tomlSchema)
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
        id: 'somenode',
        parameters: {
          foo: {
            bar: {
              bla: 'hi'
            }
          }
        }
      }
    ]
    const tomlSchema = {
      somenode: {
        foo: {
          sectioned: true
        }
      }
    }

    const result = workflow2tomltext(nodes, {}, tomlSchema)
    const expected = `
[somenode]

[somenode.foo]

bar.bla = 'hi'
`
    expect(result).toEqual(expected)
  })
})

describe('parseWorkflow()', () => {
  it('should divide global and module parameters', () => {
    const workflow = `
myglobalvar = 'something'

[somenode]

foo = 'bar'
`
    const globalKeys = new Set(['myglobalvar'])
    const result = parseWorkflow(workflow, globalKeys, {}, {})
    const expected = {
      global: {
        myglobalvar: 'something'
      },
      nodes: [
        {
          id: 'somenode',
          parameters: {
            foo: 'bar'
          }
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
    const result = parseWorkflow(workflow, new Set(), {}, {})
    const expected = {
      global: {},
      nodes: [
        {
          id: 'somenode',
          parameters: {
            foo: 'bar'
          }
        },
        {
          id: 'somenode',
          parameters: {
            foo: 'fizz'
          }
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
        id: 'somenode',
        parameters: {
          key1: [1, 2], // Array of scalar
          key2: ['a', 'b'], // Array of scalar
          key3: { a: 1, b: 2 }, // Object
          key4: { a: [1, 2] }, // Object with array of scalar
          key5: [{ a: 1 }, { a: 2 }], // Array with objects
          key6: [{ a: [1, 2] }], // Array with oboject with array of scalar
          key7: [[1, 2], [3, 4]], // Array of array of scalar
          key8: [[{ a: 1 }, { a: 2 }], [{ a: 3 }, { a: 4 }]] // Array of array of object
        }
      }]
    }
    const result = parseWorkflow(workflow, new Set(Object.keys(expected.global)), {}, {})
    expect(result).toEqual(expected)
  })

  describe('given global parameters', () => {
    it('should read array of tables as array of objects', () => {
      const workflow = `
  [[foo]]
  bar = 'fizz'
  `
      const result = parseWorkflow(workflow, new Set(['foo']), {}, {})
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

      const result = parseWorkflow(
        workflow,
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
      const tomSchema4nodes = {}

      const result = parseWorkflow(
        workflow,
        new Set(['foo']),
        tomlSchema4global,
        tomSchema4nodes
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

      const result = parseWorkflow(
        workflow,
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

      const result = parseWorkflow(
        workflow,
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
  [mol_1]

  hisd_1 = 13
  hisd_2 = 42

  [mol_2]

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

      const result = parseWorkflow(
        workflow,
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

      const result = parseWorkflow(
        workflow,
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
  })

  describe('give a node with tomlSchema', () => {
    it('should read array of tables as array of objects', () => {
      const workflow = `
  [[somenode.foo]]
  bar = 'fizz'
  `
      const result = parseWorkflow(workflow, new Set(), {}, {})
      const expected = {
        global: {},
        nodes: [{
          id: 'somenode',
          parameters: {
            foo: [{
              bar: 'fizz'
            }]
          }
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

      const result = parseWorkflow(
        workflow,
        new Set(),
        tomlSchema4global,
        tomSchema4nodes
      )

      const expected = {
        global: {},
        nodes: [{
          id: 'somenode',
          parameters: {
            foo: ['biz', 'fiz']
          }
        }]
      }
      expect(result).toEqual(expected)
    })
  })
})

describe('given read/write array with undefined', () => {
  const cases: Array<[string, any[], TomlScalarSchema, string]> = [
    [
      'scalar',
      [undefined, 42],
      {},
      dedent`
        [n1]

        foo = [
          42,
        ]
      `
    ],
    [
      'scalar indexed',
      [undefined, 42],
      { indexed: true },
      dedent`
        [n1]

        foo_2 = 42
      `
    ],
    [
      'object indexed flatten',
      [undefined, { bar: 42 }],
      { indexed: true, items: { flatten: true } },
      dedent`
        [n1]

        foo_bar_2 = 42
      `
    ],
    [
      'object sectioned',
      [undefined, { bar: 42 }],
      { items: { sectioned: true } },
      dedent`
        [n1]

        [[n1.foo]]

        bar = 42
      `
    ],
    [
      'array of object',
      [undefined, [{ bar: 42 }]],
      {},
      dedent`
        [n1]

        foo = [
          [
            { bar = 42 },
          ],
        ]
      `
    ],
    [
      'array of object indexed flatten',
      [undefined, [{ bar: 42 }]],
      {
        indexed: true,
        items: {
          indexed: true,
          items: {
            flatten: true
          }
        }
      },
      dedent`
        [n1]

        foo_bar_2_1 = 42
      `
    ],
    [
      'array of object with nested undefined',
      [undefined, [undefined, { bar: 42 }]],
      {},
      dedent`
        [n1]

        foo = [
          [
            { bar = 42 },
          ],
        ]
      `
    ],
    [
      'array of object with nested undefined indexed flatten',
      [undefined, [undefined, { bar: 42 }]],
      {
        indexed: true,
        items: {
          indexed: true,
          items: {
            flatten: true
          }
        }
      },
      dedent`
        [n1]

        foo_bar_2_2 = 42
      `
    ],
    [
      'object indexed sectioned with scalar array',
      [undefined, { bar: [undefined, 42] }],
      {
        indexed: true,
        items: {
          sectioned: true,
          properties: {
            bar: {
              indexed: true
            }
          }
        }
      },
      dedent`
        [n1]

        [n1.foo_2]

        bar_2 = 42
      `
    ]
  ]
  describe('workflow2tomltext()', () => {
    it.each(cases)('should write toml with 2 as index given %s',
      (_msg, parameter, tomlSchema, expected) => {
        const result = workflow2tomltext([{
          id: 'n1',
          parameters: { foo: parameter }
        }], {}, { n1: { foo: tomlSchema } }, {})
        const trimmed = result.replace(/\n$/, '').replace(/^\n/, '')
        expect(trimmed).toEqual(expected)
      }
    )
  })

  describe('parseWorkflow()', () => {
    const parseableCases = cases.filter(d => Object.entries(d[2]).length !== 0)
    it.each(parseableCases)('should write undefined given %s',
      (_msg, expected, tomlSchema, workflow) => {
        const globalKeys = new Set<string>()
        const result = parseWorkflow(workflow, globalKeys, {}, { n1: { foo: tomlSchema } })
        expect(result).toEqual({
          global: {},
          nodes: [{
            id: 'n1',
            parameters: expected
          }]
        })
      }
    )
  })
})
