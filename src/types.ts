import { JSONSchema7 } from 'json-schema'
import { UiSchema } from '@rjsf/core'

export type ICatalogIndex = Array<[string, string]>

export interface ICatalogNode {
  id: string
  label: string
  schema: JSONSchema7
  uiSchema?: UiSchema
  description: string
  category: string
}

export interface ICategory {
  name: string
}

export interface IGlobal {
  schema: JSONSchema7
  uiSchema?: UiSchema
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
