import Ajv from 'ajv'
import type { ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import { JSONSchema7 } from 'json-schema'
import type { IParameters, IWorkflow, IWorkflowSchema } from './types'

const ajv = new Ajv()
addFormats(ajv)

export function validate (workflow: IWorkflow, schemas: IWorkflowSchema): Array<ErrorObject<string, Record<string, any>, unknown>> {
  const globalErrors = validateParameters(
    workflow.global,
    schemas.global.schema
  )
  // TODO validate each step parameter against its node schema

  // TODO validate files, aka that all file paths in keys of files object are mentioned in parameters
  return [...globalErrors]
}

function validateParameters (parameters: IParameters, schema: JSONSchema7): Array<ErrorObject<string, Record<string, any>, unknown>> {
  const validator = ajv.compile(schema)
  if (!validator(parameters) && validator.errors !== undefined && validator.errors !== null) {
    return validator.errors
  }
  return []
}
