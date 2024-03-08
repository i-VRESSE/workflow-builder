import { JSONSchema7 } from 'json-schema'
import { UiSchema } from '@rjsf/utils'

/**
 * Array of tuples.
 *
 * Where first item in tuple is the title of the catalog.
 *
 * Where second item in tuple is the URL of the catalog YAML file.
 */
export type ICatalogIndex = Array<[string, string]>

/**
 * See [/docs/tomlSchema.md](https://github.com/i-VRESSE/workflow-builder/blob/main/docs/uiSchema.md) for documentation and examples.
 */
export interface TomlScalarSchema {
  indexed?: boolean
  flatten?: boolean
  sectioned?: boolean
  items?: TomlScalarSchema
  properties?: TomlObjectSchema
}

export interface TomlObjectSchema {
  [name: string]: TomlScalarSchema
}

export interface ICatalogNode {
  id: string
  label: string
  schema: JSONSchema7
  uiSchema: UiSchema
  formSchema?: JSONSchema7
  formUiSchema?: UiSchema
  tomlSchema?: TomlObjectSchema
  description: string
  category: string
}

export interface ICategory {
  name: string
  description: string
  collapsed?: boolean
}

export interface IGlobal {
  schema: JSONSchema7
  uiSchema: UiSchema
  formSchema?: JSONSchema7
  formUiSchema?: UiSchema
  tomlSchema?: TomlObjectSchema
}

export interface ICatalog {
  title: string
  global: IGlobal
  categories: ICategory[]
  nodes: ICatalogNode[]
  examples: Record<string, string>
}

export type IParameters = Record<string, unknown>

export interface IWorkflowNode {
  /**
   * Derived from {@link ICatalogNode.id | ICatalogNode.id}.
   */
  type: string
  parameters: IParameters
  /**
   * Unique identifier
   */
  id: string
}

/**
 * Map of files where key is the filename and value is a data url.
 * The data url looks like `data:text/markdown;name=README.md;base64,Rm9.....`
 */
export type IFiles = Record<string, string>

export interface IWorkflow {
  global: IParameters
  nodes: IWorkflowNode[]
}

export interface IWorkflowSchema {
  global: IGlobal
  nodes: ICatalogNode[]
}
