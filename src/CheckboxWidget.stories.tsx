import { ComponentMeta, ComponentStory } from '@storybook/react'
import { CollapsibleField } from './CollapsibleField'
import { action } from '@storybook/addon-actions'
import { Form } from './Form'
import { JSONSchema7 } from 'json-schema'
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


export const CheckboxWidget: ComponentStory<typeof Form> = () => {
    const schema: JSONSchema7 = {
        "type": "object",
        "title": "Boolean field",
        "properties": {
            "default": {
            "type": "boolean",
            "title": "checkbox (default)",
            "description": "This is the checkbox-description"
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


