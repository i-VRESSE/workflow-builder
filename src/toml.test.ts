import { expect, describe, it } from 'vitest'
import { parseWorkflow, steps2tomltext } from './toml'
import { INode } from './types'

describe('steps2tomltext()', () => {
  it('should index repeated nodes', () => {
    const steps = [
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
    const nodes: INode[] = [
      {
        id: 'somenode',
        label: 'Some node',
        category: 'somecategory',
        description: 'Some description',
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'string'
            }
          }
        },
        tomlSchema: {}
      }
    ]

    const result = steps2tomltext(steps, nodes)
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
  it('should de-index repeated nodes', () => {
    const workflow = `
[somenode]

foo = 'bar'

['somenode.2']

foo = 'fizz'
`
    const result = parseWorkflow(workflow)
    const expected = [
      {
        id: 'global',
        parameters: {}
      },
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
    expect(result).toEqual(expected)
  })
})
