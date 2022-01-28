import Ajv from 'ajv'
import type { ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import { JSONSchema7 } from 'json-schema'
import type { ICatalog, INode, IParameters, IStep, IWorkflow, IWorkflowSchema } from './types'

const ajv = new Ajv()
addFormats(ajv)

interface IvresseErrorObject extends ErrorObject<string, Record<string, any>, unknown> {
  workflowPath?: string
}

export type Errors = IvresseErrorObject[]

export function validateWorkflow (workflow: IWorkflow, schemas: IWorkflowSchema): Errors {
  const globalErrors = validateParameters(
    workflow.global,
    schemas.global.schema
  )
  globalErrors.forEach(e => {
    e.workflowPath = 'global'
  })
  const stepValidator = validateStep(schemas.nodes)
  const stepsErrors = workflow.steps.map(stepValidator)

  // TODO validate files,
  // that all file paths in keys of files object are mentioned in parameters
  // and all filled `type:path` fields have entry in files object
  return [...globalErrors, ...stepsErrors.flat(1)]
}

function validateStep (nodes: INode[]): (value: IStep, index: number, array: IStep[]) => Errors {
  return (step, stepIndex) => {
    const node = nodes.find((n) => n.id === step.id)
    if (node != null) {
      const stepErrors = validateParameters(
        step.parameters,
        node.schema
      )
      stepErrors.forEach(e => {
        e.workflowPath = `step[${stepIndex}]`
      })
      return stepErrors
    } else {
      // Node belonging to step could not be found
      return [{
        message: 'must have node name belonging to known nodes',
        params: {
          node: step.id
        },
        instancePath: '',
        schemaPath: '',
        keyword: 'schema',
        workflowPath: `step[${stepIndex}]`
      }]
    }
  }
}

function validateParameters (parameters: IParameters, schema: JSONSchema7): Errors {
  if (!ajv.validate(schema, parameters) && ajv.errors !== undefined && ajv.errors !== null) {
    return ajv.errors
  }
  return []
}

function validateSchema (schema: JSONSchema7): Errors {
  if (!ajv.validateSchema(schema) && ajv.errors !== undefined && ajv.errors !== null) {
    return ajv.errors
  }
  return []
}

function isCatalog (catalog: unknown): catalog is ICatalog {
  return typeof catalog === 'object' &&
    catalog !== null &&
    'global' in catalog &&
    'nodes' in catalog
  // TODO add more checks
}

export function validateCatalog (catalog: unknown): Errors {
  if (!isCatalog(catalog)) {
    return [{
      message: 'catalog malformed or missing fields',
      instancePath: '',
      schemaPath: '',
      keyword: '',
      params: {}
    }]
  }

  // Validate global schema
  const globalErrors = validateSchema(catalog.global.schema)
  globalErrors.forEach(e => {
    e.workflowPath = 'global'
  })

  // Validate node schemas
  const stepsErrors = catalog.nodes.map((n, nodeIndex) => {
    const stepErrors = validateSchema(n.schema)
    stepErrors.forEach(e => {
      e.workflowPath = `node[${nodeIndex}]`
    })
    return stepErrors
  })

  // TODO validate non schema fields
  return [...globalErrors, ...stepsErrors.flat(1)]
}
