import Ajv, { ValidateFunction } from 'ajv'
import { beforeEach, describe, expect, it } from 'vitest'
import { addMoleculeFormats, moleculeFormats } from './formats'

describe('moleculeFormats', () => {
  it('should contain residue', () => {
    expect(moleculeFormats.has('chain')).toBeTruthy()
  })
})

describe('using ajv with addMoleculeFormats()', () => {
  let ajv: Ajv
  beforeEach(() => {
    ajv = new Ajv()
    addMoleculeFormats(ajv)
  })

  describe.each([{
    format: 'chain',
    type: 'string',
    truthyCases: ['A', 'something', '12345']
  }, {
    format: 'residue',
    type: 'number',
    truthyCases: [42, 0, Number.MAX_SAFE_INTEGER]
  }])('given a JSON schema with a string with format=$format', ({ type, format, truthyCases }) => {
    let validate: ValidateFunction

    beforeEach(() => {
      validate = ajv.compile({ type, format })
    })
    it.each(truthyCases as unknown[])('should always be valid for %s', (val: unknown) => {
      const result = validate(val)
      if (validate.errors != null) {
        console.log(validate.errors)
      }
      expect(result).toBeTruthy()
    })
  })
})
