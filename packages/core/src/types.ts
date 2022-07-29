import { JSONSchema7 } from 'json-schema'
import { UiSchema } from '@rjsf/core'

export type ICatalogIndex = Array<[string, string]>

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
