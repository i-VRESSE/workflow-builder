import { expect, describe, it } from 'vitest'
import { dataURL2content, externalizeDataUrls, internalizeDataUrls } from './dataurls'

describe('externalizeDataUrls()', () => {
  it('should replace dataurl like strings with filename', () => {
    const body = 'Hello, world'
    const body64 = Buffer.from(body).toString('base64')
    const input = {
      a: 'data:text/plain;name=hello.txt;base64,' + body64,
      b: ['data:text/plain;name=hello2.txt;base64,' + body64],
      c: {
        d: 'data:text/plain;name=hello3.txt;base64,' + body64
      },
      e: [
        {
          f: 'data:text/plain;name=hello4.txt;base64,' + body64
        }
      ]
    }
    const files: Record<string, string> = {}
    const result = externalizeDataUrls(input, files)
    const expected = {
      a: 'hello.txt',
      b: ['hello2.txt'],
      c: {
        d: 'hello3.txt'
      },
      e: [
        {
          f: 'hello4.txt'
        }
      ]
    }
    expect(result).toEqual(expected)
    const expectedFiles = {
      'hello.txt': 'data:text/plain;name=hello.txt;base64,' + body64,
      'hello2.txt': 'data:text/plain;name=hello2.txt;base64,' + body64,
      'hello3.txt': 'data:text/plain;name=hello3.txt;base64,' + body64,
      'hello4.txt': 'data:text/plain;name=hello4.txt;base64,' + body64
    }
    expect(files).toEqual(expectedFiles)
  })
})

describe('internalizeDataUrls()', () => {
  it('should replace filenames with dataurls', () => {
    const body = 'Hello, world'
    const body64 = Buffer.from(body).toString('base64')
    const input = {
      a: 'hello.txt',
      b: ['hello2.txt'],
      c: {
        d: 'hello3.txt'
      },
      e: [
        {
          f: 'hello4.txt'
        }
      ]
    }
    const files = {
      'hello.txt': 'data:text/plain;name=hello.txt;base64,' + body64,
      'hello2.txt': 'data:text/plain;name=hello2.txt;base64,' + body64,
      'hello3.txt': 'data:text/plain;name=hello3.txt;base64,' + body64,
      'hello4.txt': 'data:text/plain;name=hello4.txt;base64,' + body64
    }
    const result = internalizeDataUrls(input, files)
    const expected = {
      a: 'data:text/plain;name=hello.txt;base64,' + body64,
      b: ['data:text/plain;name=hello2.txt;base64,' + body64],
      c: {
        d: 'data:text/plain;name=hello3.txt;base64,' + body64
      },
      e: [
        {
          f: 'data:text/plain;name=hello4.txt;base64,' + body64
        }
      ]
    }
    expect(result).toEqual(expected)
  })
})

describe('dataURL2content()', () => {
  const body = 'Hello, world'
  const body64 = Buffer.from(body).toString('base64')
  const url ='data:text/plain;name=hello.txt;base64,' + body64

  const actual = dataURL2content(url)
  expect(actual).toEqual(body)
})
