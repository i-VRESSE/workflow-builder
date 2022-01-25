import { JSONSchema7 } from 'json-schema'
import { UiSchema } from '@rjsf/core'

export interface INode {
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
  nodes: INode[]
  templates: Record<string, string>
}

export type IParameters = Record<string, unknown>

export interface IStep {
  id: string
  parameters: IParameters
}

export type IFiles = Record<string, string>

export interface IWorkflow {
  global: IParameters
  steps: IStep[]
}

export interface IWorkflowSchema {
  global: IGlobal
  nodes: INode[]
}
