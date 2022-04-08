import { beforeEach, describe, expect, it } from 'vitest'
import { JSONSchema7 } from 'json-schema'
import { IFiles, IParameters } from '../types'
import { addMoleculeValidation } from './addMoleculeValidation'
import { JSONSchema7WithMaxItemsFrom } from '../resolveMaxItemsFrom'

describe('addMoleculeValidation()', () => {
  describe('given a molecule with chain A', () => {
    let globalParameters: IParameters
    let globalSchema: JSONSchema7
    let files: IFiles

    beforeEach(() => {
      globalParameters = {
        molecules: ['a.pdb']
      }
      globalSchema = {
        type: 'object',
        properties: {
          molecules: {
            type: 'array',
            format: 'moleculefilepaths',
            items: {
              type: 'string'
            }
          }
        }
      }
      const body = 'ATOM     32  N  AARG A  -3      11.281  86.699  94.383  0.50 35.88           N  '
      const file = 'data:text/plain;name=a.pdb;base64,' + Buffer.from(body).toString('base64')
      files = {
        'a.pdb': file
      }
    })

    it('should return schema unchanged', () => {
      const itemsSchema: JSONSchema7 = {
        type: 'string'
      }
      const propSchema: JSONSchema7WithMaxItemsFrom = {
        type: 'array',
        items: itemsSchema
      }
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: propSchema
        }
      }
      const actual = addMoleculeValidation(schema, globalParameters, globalSchema, files)
      expect(actual).toEqual(schema)
    })

    describe('in array of array of object with prop with format:chain', () => {
      it('should set enum to [A]', () => {
        const schema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                prop1: {
                  type: 'string',
                  format: 'chain'
                }
              }
            }
          }
        }
        const actual = addMoleculeValidation(schema, globalParameters, globalSchema, files)
        console.log(actual)
        const expected: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: [{
            type: 'array',
            items: {
              type: 'object',
              properties: {
                prop1: {
                  type: 'string',
                  format: 'chain',
                  enum: ['A']
                }
              }
            }
          }]
        }
        expect(actual).toEqual(expected)
      })
    })
  })
})
