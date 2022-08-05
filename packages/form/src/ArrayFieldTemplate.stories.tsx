import { ComponentMeta, ComponentStory } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { JSONSchema7 } from 'json-schema'

import { Form } from './Form'

const meta: ComponentMeta<typeof Form> = {
  title: 'Array',
  component: Form
}

export default meta

function render (schema: JSONSchema7, uiSchema: {} = {}): JSX.Element {
  const formData = {
    nested1: ['a', 'b', 'c', 'd', 'e', 'f']
  }
  return (
    <Form
      schema={schema}
      uiSchema={uiSchema}
      formData={formData}
      onSubmit={action('onSubmit')}
    />
  )
}

export const NoUiSchema: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      nested1: {
        type: 'array',
        title: 'Array of string',
        items: {
          type: 'string'
        }
      }
    },
    additionalProperties: false
  }
  return render(schema)
}

export const IndexableArray: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      nested1: {
        type: 'array',
        title: 'Array of string',
        items: {
          type: 'string'
        }
      }
    },
    additionalProperties: false
  }
  const uiSchema = {
    nested1: {
      'ui:indexable': true
    }
  }
  return render(schema, uiSchema)
}

export const NoUiSchemaFixed: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      nested1: {
        type: 'array',
        title: 'Array of string',
        items: [{
          type: 'string'
        }, {
          type: 'string'
        }, {
          type: 'string'
        }, {
          type: 'string'
        }, {
          type: 'string'
        }, {
          type: 'string'
        }]
      }
    },
    additionalProperties: false
  }
  return render(schema)
}

export const IndexableArrayFixed: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      nested1: {
        type: 'array',
        title: 'Array of string',
        items: [{
          type: 'string'
        }, {
          type: 'string'
        }, {
          type: 'string'
        }, {
          type: 'string'
        }, {
          type: 'string'
        }, {
          type: 'string'
        }]
      }
    },
    additionalProperties: false
  }
  const uiSchema = {
    nested1: {
      'ui:indexable': true
    }
  }
  return render(schema, uiSchema)
}

export const IndexableArrayWithPredefinedLabels: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      nested1: {
        type: 'array',
        title: 'Array of string',
        items: {
          type: 'string'
        }
      }
    },
    additionalProperties: false
  }
  const uiSchema = {
    nested1: {
      'ui:indexable': ['1st', '2nd', '3rd'],
      'ui:orderable': false
    }
  }
  return render(schema, uiSchema)
}

export const IndexableArrayWithLongPredefinedLabels: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      nested1: {
        type: 'array',
        title: 'Array of string',
        items: {
          type: 'string'
        }
      }
    },
    additionalProperties: false
  }
  const uiSchema = {
    nested1: {
      'ui:indexable': ['a/very/long_path/to.1st', '2nd', '3rd'],
      'ui:orderable': true
    }
  }
  return render(schema, uiSchema)
}
