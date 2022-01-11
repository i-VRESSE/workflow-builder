import { JSONSchema7 } from 'json-schema'
import { UiSchema } from '@rjsf/core'

export interface TomlSchema {
  nesting?: 'global' | 'section' | 'inline'
  indexPrefix?: string
  items?: Record<string, TomlSchema>
}

export interface INode {
  id: string
  label: string
  schema: JSONSchema7
  uiSchema?: UiSchema
  tomlSchema?: TomlSchema
  description: string
  category: string
}

export interface ICategory {
  name: string
}

export interface ICatalog {
  categories: ICategory[]
  nodes: INode[]
  templates: Record<string, string>
}

export interface IStep {
  id: string
  parameters: Record<string, unknown>
}

export type IFiles = Record<string, string>
