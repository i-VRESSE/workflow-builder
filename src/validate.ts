import Ajv from 'ajv'
import type { ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import { JSONSchema7 } from 'json-schema'
import type { ICatalog, ICatalogNode, IParameters, IWorkflowNode, IWorkflow, IWorkflowSchema } from './types'

const ajv = new Ajv()
addFormats(ajv)

interface IvresseErrorObject extends ErrorObject<string, Record<string, any>, unknown> {
  workflowPath?: string
}

export type Errors = IvresseErrorObject[]

export class ValidationError extends Error {
  constructor (message: string, public errors: IvresseErrorObject[] = []) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export function validateWorkflow (workflow: IWorkflow, schemas: IWorkflowSchema): Errors {
  const globalErrors = validateParameters(
    workflow.global,
    schemas.global.schema
  )
  globalErrors.forEach(e => {
    e.workflowPath = 'global'
  })
  const nodeValidator = validateNode(schemas.nodes)
  const nodesErrors = workflow.nodes.map(nodeValidator)

  // TODO validate files,
  // that all file paths in keys of files object are mentioned in parameters
  // and all filled `type:path` fields have entry in files object
  return [...globalErrors, ...nodesErrors.flat(1)]
}

function validateNode (catalogNodes: ICatalogNode[]): (value: IWorkflowNode, index: number, array: IWorkflowNode[]) => Errors {
  return (node, nodeIndex) => {
    const catalogNode = catalogNodes.find((n) => n.id === node.id)
    if (catalogNode != null) {
      const nodeErrors = validateParameters(
        node.parameters,
        catalogNode.schema
      )
      nodeErrors.forEach(e => {
        e.workflowPath = `node[${nodeIndex}]`
      })
      return nodeErrors
    } else {
      // Node belonging to node could not be found
      return [{
        message: 'must have node name belonging to known nodes',
        params: {
          node: node.id
        },
        instancePath: '',
        schemaPath: '',
        keyword: 'schema',
        workflowPath: `node[${nodeIndex}]`
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
  if (!(ajv.validateSchema(schema) as boolean) && ajv.errors !== undefined && ajv.errors !== null) {
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
  const nodesErrors = catalog.nodes.map((n, nodeIndex) => {
    const nodeErrors = validateSchema(n.schema)
    nodeErrors.forEach(e => {
      e.workflowPath = `node[${nodeIndex}]`
    })
    return nodeErrors
  })

  // TODO validate non schema fields
  return [...globalErrors, ...nodesErrors.flat(1)]
}
