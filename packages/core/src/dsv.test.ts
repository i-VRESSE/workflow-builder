import { it, describe, expect } from 'vitest'
import { mergeHeader, splitHeader } from './dsv'

const cases: Array<[string, string[]]> = [
  ['foo', ['foo']],
  ['foo.1', ['foo', '1']],
  ['foo.bar', ['foo', 'bar']],
  ["'foo.bar'", ['foo.bar']],
  ["'foo.1'", ['foo.1']],
  ["'foo.42'", ['foo.42']],
  ["'foo.bar'.bla", ['foo.bar', 'bla']],
  ["'foo.1'.bla", ['foo.1', 'bla']],
  ["'foo.1'.bla.bar", ['foo.1', 'bla', 'bar']]
]

describe('splitHeader()', () => {
  it.each(cases)('should split %s', (input, expected) => {
    const actual = splitHeader(input)
    expect(actual).toEqual(expected)
  })
})

describe('mergeHeader()', () => {
  it.each(cases)('should merge %s', (expected, input) => {
    const actual = mergeHeader(input)
    expect(actual).toEqual(expected)
  })
})
