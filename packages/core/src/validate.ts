import Ajv from 'ajv'
import type { ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import { JSONSchema7 } from 'json-schema'
import { addMoleculeFormats } from '@i-vresse/wb-form'
import type {
  ICatalogNode,
  IParameters,
  IWorkflowNode,
  IWorkflow,
  IWorkflowSchema,
  ICatalog,
  IFiles
} from './types'
import { ajvKeyword, ajvKeyword2, resolveMaxItemsFrom } from './resolveMaxItemsFrom'
import { addMoleculeValidation, parseMolecules } from './molecule/addMoleculeValidation'

const ajv = new Ajv({
  // In addMoleculeValidation() we replace items:{} with items:[{}, {}, ...]
  // Ajv expects minItems:<length of array>, but the app can have minItems:0
  // To silence `strict mode: "items" is 1-tuple, but minItems or maxItems/additionalItems are not specified or different at path` message
  // the strictTuples check can be disable by uncommenting next line
  // strictTuples: false
  useDefaults: true
})
addFormats(ajv)
addMoleculeFormats(ajv)
ajv.addKeyword(ajvKeyword)
ajv.addKeyword(ajvKeyword2)

export interface IvresseErrorObject
  extends ErrorObject<string, Record<string, any>, unknown> {
  /**
   * Location in workflow where error occured.
   * Can be `global` if error is in the global parameters.
   * Can be `nodes[index]` if error is in the parameters of node with given index.
   */
  workflowPath?: string
}

export type Errors = IvresseErrorObject[]

export class ValidationError extends Error {
  constructor (message: string, public errors: IvresseErrorObject[] = []) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export async function validateWorkflow (
  workflow: IWorkflow,
  schemas: IWorkflowSchema,
  files: IFiles = {}
): Promise<Errors> {
  const globalSchema = schemas.global.schema
  const globalErrors = validateParameters(
    workflow.global,
    schemas.global.schema
  )
  globalErrors.forEach((e) => {
    e.workflowPath = 'global'
  })
  const nodeValidator = await validateNodeFactory(
    schemas.nodes,
    workflow.global,
    globalSchema,
    files
  )
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
): Promise<
  (value: IWorkflowNode, index: number, array: IWorkflowNode[]) => Errors
  > {
  const [moleculeInfos, moleculesPropName] = parseMolecules(
    globalParameters,
    globalSchema,
    files
  )
  const id2schema = Object.fromEntries(
    await Promise.all(
      catalogNodes.map(async (c) => {
        const schemaWithMaxItems = resolveMaxItemsFrom(
          c.schema,
          globalParameters
        )
        const schemaWithMolInfo = addMoleculeValidation(
          schemaWithMaxItems,
          moleculeInfos,
          moleculesPropName
        )
        return [c.id, schemaWithMolInfo]
      })
    )
  )
  return (node, nodeIndex) => {
    const schema = id2schema[node.type]
    if (schema != null) {
      const nodeErrors = validateParameters(node.parameters, schema)
      nodeErrors.forEach((e) => {
        e.workflowPath = `nodes[${nodeIndex}]`
      })
      return nodeErrors
    } else {
      // Node belonging to node could not be found
      return [
        {
          message: 'must have node name belonging to known nodes',
          params: {
            node: node.type
          },
          instancePath: '',
          schemaPath: '',
          keyword: 'schema',
          workflowPath: `nodes[${nodeIndex}]`
        }
      ]
    }
  }
}

function validateParameters (
  parameters: IParameters,
  schema: JSONSchema7
): Errors {
  if (
    !ajv.validate(schema, parameters) &&
    ajv.errors !== undefined &&
    ajv.errors !== null
  ) {
    return ajv.errors
  }
  return []
}

function validateSchema (schema: JSONSchema7): Errors {
  if (
    !(ajv.validateSchema(schema) as boolean) &&
    ajv.errors !== undefined &&
    ajv.errors !== null
  ) {
    return ajv.errors
  }
  return []
}

/**
 * Validate the schemas in a catalog.
 *
 * The schemas should be formatted according to JSON schema draft7.
 *
 * @param catalog
 */
export function validateCatalog (catalog: ICatalog): Errors {
  // Validate global schema
  const globalErrors = validateSchema(catalog.global.schema)
  globalErrors.forEach((e) => {
    e.workflowPath = 'global'
  })

  // Validate node schemas
  const nodesErrors = catalog.nodes.map((n, nodeIndex) => {
    const nodeErrors = validateSchema(n.schema)
    nodeErrors.forEach((e) => {
      e.workflowPath = `nodes[${nodeIndex}]`
    })
    return nodeErrors
  })

  // TODO validate non schema fields
  return [...globalErrors, ...nodesErrors.flat(1)]
}

export function flattenValidationErrors (error: ValidationError): string[] {
  return error.errors.map((e) => {
    if (e.workflowPath === undefined || e.message === undefined) {
      return ''
    }
    let message = e.message
    message = `Error in ${e.workflowPath}${e.instancePath}: ${message}`
    if (typeof e.params.additionalProperty === 'string') {
      message += `: ${e.params.additionalProperty}`
    }
    if (Array.isArray(e.params.allowedValues)) {
      const values = e.params.allowedValues.map(d => String(d))
      message += `: ${values.join(', ')}`
    }
    return message
  }).filter(m => m !== '')
}
