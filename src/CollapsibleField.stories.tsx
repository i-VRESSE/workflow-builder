import { ComponentMeta, ComponentStory } from '@storybook/react'
import { JSONSchema7 } from 'json-schema'
import { Form } from './Form'
import { CollapsibleField } from './CollapsibleField'
import 'bootstrap/dist/css/bootstrap.min.css'
import { UiSchema } from '@rjsf/core'

const meta: ComponentMeta<typeof CollapsibleField> = {
  title: 'CollapsibleField',
  component: CollapsibleField
}

export default meta

function render (schema: JSONSchema7, uiSchema: UiSchema): JSX.Element {
  const fields = {
    collapsible: CollapsibleField
  }
  return (
    <Form
      fields={fields}
      schema={schema}
      uiSchema={uiSchema}
    />
  )
}

export const Default: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      prop2: {
        type: 'string'
      },
      group1: {
        type: 'object',
        properties: {
          prop1: {
            type: 'string'
          },
          prop3: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
    },
    additionalProperties: false
  }
  const uiSchema = {
    group1: {
      'ui:field': 'collapsible'
    }
  }
  return render(schema, uiSchema)
}

export const EmptyUiSchema: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      prop2: {
        type: 'string'
      },
      group1: {
        type: 'object',
        properties: {
          prop1: {
            type: 'string'
          },
          prop3: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
    },
    additionalProperties: false
  }
  const uiSchema = {
  }
  return render(schema, uiSchema)
}

export const InitiallyExpanded: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      prop2: {
        type: 'string'
      },
      group1: {
        type: 'object',
        properties: {
          prop1: {
            type: 'string'
          },
          prop3: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
    },
    additionalProperties: false
  }
  const uiSchema = {
    group1: {
      'ui:field': 'collapsible',
      'ui:collapsed': false
    }
  }
  return render(schema, uiSchema)
}

export const InitiallyCollapsed: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      prop2: {
        type: 'string'
      },
      group1: {
        type: 'object',
        properties: {
          prop1: {
            type: 'string'
          },
          prop3: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
    },
    additionalProperties: false
  }
  const uiSchema = {
    group1: {
      'ui:field': 'collapsible',
      'ui:collapsed': true
    }
  }
  return render(schema, uiSchema)
}
