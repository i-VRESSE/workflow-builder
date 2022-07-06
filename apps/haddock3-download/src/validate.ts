import Ajv from 'ajv'
import type { ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import { JSONSchema7 } from 'json-schema'
import type { ICatalogNode, IParameters, IWorkflowNode, IWorkflow, IWorkflowSchema, ICatalog, IFiles } from './types'
import { ajvKeyword, resolveMaxItemsFrom } from './resolveMaxItemsFrom'
import { addMoleculeFormats } from './molecule/formats'
import { addMoleculeValidation } from './molecule/addMoleculeValidation'

const ajv = new Ajv({
  // In addMoleculeValidation() we replace items:{} with items:[{}, {}, ...]
  // Ajv expects minItems:<length of array>, but the app can have minItems:0
  // To silence `strict mode: "items" is 1-tuple, but minItems or maxItems/additionalItems are not specified or different at path` message
  // the strictTuples check can be disable by uncommenting next line
  // strictTuples: false
})
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

export async function validateWorkflow (workflow: IWorkflow, schemas: IWorkflowSchema, files: IFiles = {}): Promise<Errors> {
  const globalSchema = schemas.global.schema
  const globalErrors = validateParameters(
    workflow.global,
    schemas.global.schema
  )
  globalErrors.forEach(e => {
    e.workflowPath = 'global'
  })
  const nodeValidator = await validateNodeFactory(schemas.nodes, workflow.global, globalSchema, files)
  const nodesErrors = workflow.nodes.map(nodeValidator)

  // TODO validate files,
  // that all file paths in keys of files object are mentioned in parameters
  // and all filled `type:path` fields have entry in files object
  return [...globalErrors, ...nodesErrors.flat(1)]
}

async function validateNodeFactory (
  catalogNodes: ICatalogNode[],
  globalParameters: IParameters,
  globalSchema: JSONSchema7,
  files: IFiles
): Promise<(value: IWorkflowNode, index: number, array: IWorkflowNode[]) => Errors> {
  const id2schema = Object.fromEntries(await Promise.all(catalogNodes.map(async c => {
    const schemaWithMaxItems = resolveMaxItemsFrom(c.schema, globalParameters)
    const schemaWithMolInfo = await addMoleculeValidation(
      schemaWithMaxItems, globalParameters, globalSchema, files
    )
    return [c.id, schemaWithMolInfo]
  })))
  return (node, nodeIndex) => {
    const schema = id2schema[node.type]
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
          node: node.type
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
