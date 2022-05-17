import { ComponentMeta, ComponentStory } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Form } from './Form'
import { JSONSchema7 } from 'json-schema'
import { Widgets } from '@rjsf/bootstrap-4/'


const meta: ComponentMeta<typeof Widgets.CheckboxWidget> = {
  title: 'Checkbox',
  component: Widgets.CheckboxWidget
}

export default meta

function render(schema: JSONSchema7): JSX.Element {
  debugger
  return (
    <Form
      schema={schema}
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

  return render(schema)
}


