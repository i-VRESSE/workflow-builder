import { expect, describe, it } from 'vitest'
import { parseWorkflow, workflow2tomltext } from './toml'

describe('nodes2tomltext()', () => {
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

    const result = workflow2tomltext(nodes, {})
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
