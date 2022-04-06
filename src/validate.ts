import Ajv from 'ajv'
import type { ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import { JSONSchema7 } from 'json-schema'
import type { ICatalogNode, IParameters, IWorkflowNode, IWorkflow, IWorkflowSchema, ICatalog } from './types'
import { ajvKeyword, resolveMaxItemsFrom } from './resolveMaxItemsFrom'
import { addMoleculeFormats } from './molecule/formats'

const ajv = new Ajv()
addFormats(ajv)
addMoleculeFormats(ajv)
ajv.addKeyword(ajvKeyword)

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
  const nodeValidator = validateNodeFactory(schemas.nodes, workflow.global)
  const nodesErrors = workflow.nodes.map(nodeValidator)

  // TODO validate files,
  // that all file paths in keys of files object are mentioned in parameters
  // and all filled `type:path` fields have entry in files object
  return [...globalErrors, ...nodesErrors.flat(1)]
}

function validateNodeFactory (catalogNodes: ICatalogNode[], global: IParameters): (value: IWorkflowNode, index: number, array: IWorkflowNode[]) => Errors {
  const id2schema = Object.fromEntries(catalogNodes.map(c => [c.id, resolveMaxItemsFrom(c.schema, global)]))
  return (node, nodeIndex) => {
    const schema = id2schema[node.id]
    if (schema != null) {
      const nodeErrors = validateParameters(
        node.parameters,
        schema
      )
      nodeErrors.forEach(e => {
        e.workflowPath = `nodes[${nodeIndex}]`
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
        workflowPath: `nodes[${nodeIndex}]`
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

export function validateCatalog (catalog: ICatalog): Errors {
  // Validate global schema
  const globalErrors = validateSchema(catalog.global.schema)
  globalErrors.forEach(e => {
    e.workflowPath = 'global'
  })

  // Validate node schemas
  const nodesErrors = catalog.nodes.map((n, nodeIndex) => {
    const nodeErrors = validateSchema(n.schema)
    nodeErrors.forEach(e => {
      e.workflowPath = `nodes[${nodeIndex}]`
    })
    return nodeErrors
  })

  // TODO validate non schema fields
  return [...globalErrors, ...nodesErrors.flat(1)]
}
