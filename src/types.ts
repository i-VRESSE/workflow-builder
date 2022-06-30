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
  id: string
  parameters: IParameters
  code: string
}

export type IFiles = Record<string, string>

export interface IWorkflow {
  global: IParameters
  nodes: IWorkflowNode[]
}

export interface IWorkflowSchema {
  global: IGlobal
  nodes: ICatalogNode[]
}

export interface DragItem {
  index: number
  id: string
  type: string
}
