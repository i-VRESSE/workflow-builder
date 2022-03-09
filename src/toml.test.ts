import { expect, describe, it } from 'vitest'
import { parseWorkflow, workflow2tomltext } from './toml'
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
    // TODO keep order of keys in toml same as in source
    /* eslint-disable no-tabs */
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
    /* eslint-enable no-tabs */
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
    const result = parseWorkflow(workflow, globalKeys)
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
    const result = parseWorkflow(workflow, new Set())
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
})
