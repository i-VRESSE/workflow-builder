import { describe, expect, it } from 'vitest'
import { JSONSchema7 } from 'json-schema'

import { IParameters } from './types'
import { JSONSchema7WithMaxItemsFrom, resolveMaxItemsFrom } from './resolveMaxItemsFrom'

describe('resolveMaxItemsFrom()', () => {
  describe('given a formSchema without maxItemsFrom annotation', () => {
    describe('given empty global parameters', () => {
      it('should return formSchema unchanged', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          title: 'Which molecules are a shape?',
          items: {
            default: false,
            title: 'Is this molecule a shape?',
            type: 'boolean'
          }
        }
        const formSchema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }
        const globalParameters: IParameters = {}

        const actual = resolveMaxItemsFrom(formSchema, globalParameters)

        expect(actual).toStrictEqual(formSchema)
      })
    })
  })

  describe('given a formSchema with maxItemsFrom annotation', () => {
    describe('given empty global parameters', () => {
      it('should return formSchema unchanged', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          title: 'Which molecules are a shape?',
          items: {
            default: false,
            title: 'Is this molecule a shape?',
            type: 'boolean'
          },
          maxItemsFrom: 'molecules'
        }
        const formSchema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }
        const globalParameters: IParameters = {}

        const actual = resolveMaxItemsFrom(formSchema, globalParameters)

        expect(actual).toStrictEqual(formSchema)
      })
    })
  })

  describe('given a formSchema with maxItemsFrom annotation', () => {
    describe('given 3 molecules in global parameters', () => {
      it('should return formSchema with maxItems:3', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          title: 'Which molecules are a shape?',
          items: {
            default: false,
            title: 'Is this molecule a shape?',
            type: 'boolean'
          },
          maxItemsFrom: 'molecules'
        }
        const formSchema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }
        const globalParameters: IParameters = {
          molecules: ['1.pdb', '2.pdb', '3.pdb']
        }

        const actual = resolveMaxItemsFrom(formSchema, globalParameters)

        const expectedProp: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          title: 'Which molecules are a shape?',
          items: {
            default: false,
            title: 'Is this molecule a shape?',
            type: 'boolean'
          },
          maxItemsFrom: 'molecules',
          maxItems: 3
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: expectedProp
          }
        }
        expect(actual).toStrictEqual(expected)
      })
    })
  })

  describe('given a formSchema with nested maxItemsFrom annotation', () => {
    describe('given 3 molecules in global parameters', () => {
      it('should return formSchema with maxItems:3', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          title: 'Which molecules are a shape?',
          items: {
            default: false,
            title: 'Is this molecule a shape?',
            type: 'boolean'
          },
          maxItemsFrom: 'molecules'
        }
        const formSchema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: {
              type: 'object',
              properties: {
                prop2: propSchema
              }
            }
          }
        }
        const globalParameters: IParameters = {
          molecules: ['1.pdb', '2.pdb', '3.pdb']
        }

        const actual = resolveMaxItemsFrom(formSchema, globalParameters)

        const expectedProp: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          title: 'Which molecules are a shape?',
          items: {
            default: false,
            title: 'Is this molecule a shape?',
            type: 'boolean'
          },
          maxItemsFrom: 'molecules',
          maxItems: 3
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: {
              type: 'object',
              properties: {
                prop2: expectedProp
              }
            }
          }
        }
        expect(actual).toStrictEqual(expected)
      })
    })
  })

  describe('given a formSchema with maxItemsFrom annotation and items is array', () => {
    describe('given 3 molecules in global parameters', () => {
      it('should return formSchema with maxItems:3', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          title: 'Which molecules have contacts?',
          items: {
            title: 'Contect residues of molecule',
            type: 'array',
            items: {
              type: 'number'
            }
          },
          maxItemsFrom: 'molecules'
        }
        const formSchema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }
        const globalParameters: IParameters = {
          molecules: ['1.pdb', '2.pdb', '3.pdb']
        }

        const actual = resolveMaxItemsFrom(formSchema, globalParameters)

        const expectedProp: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          title: 'Which molecules have contacts?',
          items: {
            title: 'Contect residues of molecule',
            type: 'array',
            items: {
              type: 'number'
            }
          },
          default: [
            [],
            [],
            []
          ],
          maxItemsFrom: 'molecules',
          maxItems: 3
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: expectedProp
          }
        }
        expect(actual).toStrictEqual(expected)
      })
    })
  })
})
