import { ComponentMeta, ComponentStory } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { TableField } from './TableField'
import { JSONSchema7 } from 'json-schema'
import { Form } from '../Form'
import 'bootstrap/dist/css/bootstrap.min.css'
import { UiSchema } from '@rjsf/core'

const meta: ComponentMeta<typeof TableField> = {
  title: 'TableField',
  component: TableField
}

export default meta

function render (schema: JSONSchema7, uiSchema: UiSchema, formData = {}): JSX.Element {
  const fields = {
    table: TableField
  }
  return (
    <Form
      fields={fields}
      schema={schema}
      uiSchema={uiSchema}
      formData={formData}
      onSubmit={action('onSubmit')}
    />
  )
}

export const ArrayOfObjectsWithoutUISchema: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      group1: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            prop1: {
              type: 'string'
            },
            prop2: {
              type: 'string'
            }
          },
          additionalProperties: false
        }
      }
    },
    additionalProperties: false
  }
  const uiSchema = {
  }
  return render(schema, uiSchema)
}

export const ArrayOfObjectsAsTable: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      nested1: {
        type: 'array',
        title: 'Array of {prop1,prop2}',
        items: {
          type: 'object',
          properties: {
            prop1: {
              title: 'Prop 1',
              description: 'Description 1',
              type: 'string'
            },
            prop2: {
              title: 'Prop 2',
              description: 'Description 2',
              type: 'string'
            }
          },
          additionalProperties: false
        }
      }
    },
    additionalProperties: false
  }
  const uiSchema = {
    nested1: {
      'ui:field': 'table'
    }
  }
  const formData = {
    nested1: [{
      prop1: '11',
      prop2: '22'
    }, {
      prop1: '33',
      prop2: '44'
    }]
  }
  return render(schema, uiSchema, formData)
}

export const ArrayOfObjectsAsTableWithCustomWidth: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      nested1: {
        type: 'array',
        title: 'Array of {prop1,prop2}',
        items: {
          type: 'object',
          properties: {
            prop1: {
              title: 'Prop 1',
              description: 'Description 1',
              type: 'string'
            },
            prop2: {
              title: 'Prop 2',
              description: 'Description 2',
              type: 'string'
            }
          },
          additionalProperties: false
        }
      }
    },
    additionalProperties: false
  }
  const uiSchema = {
    nested1: {
      'ui:field': 'table',
      'ui:options': {
        widths: {
          prop1: '30%'
        }
      }
    }
  }
  const formData = {
    nested1: [{
      prop1: '11',
      prop2: '22'
    }, {
      prop1: '33',
      prop2: '44'
    }]
  }
  return render(schema, uiSchema, formData)
}

export const ArrayOfObjectsOfObjectsAsTable: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      nested1: {
        type: 'array',
        title: 'Array of {prop1,prop2}',
        items: {
          type: 'object',
          properties: {
            prop1: {
              title: 'Prop 1',
              description: 'Description 1',
              type: 'object',
              properties: {
                prop1a: {
                  type: 'string',
                  title: 'Prop 1 a',
                  description: 'Description 1 a'
                },
                prop1b: {
                  type: 'string',
                  title: 'Prop 1 b',
                  description: 'Description 1 b'
                }
              }
            }
          },
          additionalProperties: false
        }
      }
    },
    additionalProperties: false
  }
  const uiSchema = {
    nested1: {
      'ui:field': 'table'
    }
  }
  const formData = {
    nested1: [{
      prop1: {
        prop1a: '11',
        prop1b: '22'
      }
    }, {
      prop1: {
        prop1a: '44',
        prop1b: '55'
      }
    }]
  }
  return render(schema, uiSchema, formData)
}

export const ArrayOfObjectsWithRequiredPropsAsTable: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      nested1: {
        type: 'array',
        title: 'Array of {prop1,prop2}',
        items: {
          type: 'object',
          properties: {
            prop1: {
              title: 'Prop 1',
              description: 'Description 1',
              type: 'string'
            },
            prop2: {
              title: 'Prop 2',
              description: 'Description 2',
              type: 'string'
            }
          },
          required: ['prop1', 'prop2'],
          additionalProperties: false
        }
      }
    },
    additionalProperties: false
  }
  const uiSchema = {
    nested1: {
      'ui:field': 'table'
    }
  }
  const formData = {
    nested1: [{
      prop1: '11',
      prop2: '22'
    }, {
      prop1: '33',
      prop2: '44'
    }]
  }
  return render(schema, uiSchema, formData)
}

export const ArrayOfObjectsOfObjectsWithRequiredPropsAsTable: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      nested1: {
        type: 'array',
        title: 'Array of {prop1,prop2}',
        items: {
          type: 'object',
          properties: {
            prop1: {
              title: 'Prop 1',
              description: 'Description 1',
              type: 'object',
              properties: {
                prop1a: {
                  type: 'string',
                  title: 'Prop 1 a',
                  description: 'Description 1 a'
                },
                prop1b: {
                  type: 'string',
                  title: 'Prop 1 b',
                  description: 'Description 1 b'
                }
              },
              required: ['prop1a', 'prop1b']
            }
          },
          required: ['prop1'],
          additionalProperties: false
        }
      }
    },
    additionalProperties: false
  }
  const uiSchema = {
    nested1: {
      'ui:field': 'table'
    }
  }
  const formData = {
    nested1: [{
      prop1: {
        prop1a: '11',
        prop1b: '22'
      }
    }, {
      prop1: {
        prop1a: '44',
        prop1b: '55'
      }
    }]
  }
  return render(schema, uiSchema, formData)
}
