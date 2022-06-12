import { expect, describe, it } from 'vitest'
import { dedupWorkflow, parseWorkflow, TomlSchemas, workflow2tomltext } from './toml'
import { IParameters } from './types'

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
      id: 'somenode',
      parameters: {
        foo: ['biz', 'fiz']
      }
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

describe.only('dedupWorkflow()', () => {
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
      'dups',
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
