import { ComponentMeta, ComponentStory } from '@storybook/react'
import { action } from '@storybook/addon-actions'
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
      onSubmit={action('onSubmit')}
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

export const Validation: ComponentStory<typeof Form> = () => {
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
            type: 'string',
            minLength: 3
          },
          prop3: {
            type: 'string',
            default: 'something'
          }
        },
        required: ['prop1'],
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

export const Nested: ComponentStory<typeof Form> = () => {
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
          },
          group2: {
            type: 'object',
            properties: {
              prop4: {
                type: 'string'
              },
              prop5: {
                type: 'string'
              }
            },
            additionalProperties: false
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
      group2: {
        'ui:field': 'collapsible'
      }
    }
  }
  return render(schema, uiSchema)
}

export const Multi: ComponentStory<typeof Form> = () => {
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
      },
      group2: {
        type: 'object',
        properties: {
          prop4: {
            type: 'string'
          },
          prop5: {
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
    },
    group2: {
      'ui:field': 'collapsible'
    }
  }
  return render(schema, uiSchema)
}

export const Title: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    properties: {
      prop2: {
        type: 'string'
      },
      group1: {
        title: 'Group 1 title',
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

export const TitleFromUiSchema: ComponentStory<typeof Form> = () => {
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
      'ui:title': 'Group 1 title from uiSchema ui:title',
      'ui:field': 'collapsible'
    }
  }
  return render(schema, uiSchema)
}

export const TitleFromUiSchemaOptions: ComponentStory<typeof Form> = () => {
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
      'ui:options': {
        title: 'Group 1 title from uiSchema ui:options.title',
        collapsed: true
      }
    }
  }
  return render(schema, uiSchema)
}

export const CollapsedDefaultSubmitted: ComponentStory<typeof Form> = () => {
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
            type: 'string',
            default: 'somevalue1'
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
