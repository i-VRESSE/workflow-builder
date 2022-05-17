import { ComponentMeta, ComponentStory } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Form } from './Form'
import { JSONSchema7 } from 'json-schema'
import { IvresseCheckboxWidget } from './IvresseCheckboxWidget'


const meta: ComponentMeta<typeof IvresseCheckboxWidget> = {
  title: 'Checkbox',
  component: IvresseCheckboxWidget
}

export default meta

function render(schema: JSONSchema7): JSX.Element {
  const customWidgets = {CheckboxWidget: IvresseCheckboxWidget};
  return (
    <Form
      schema={schema}
      onSubmit={action('onSubmit')}
      widgets={customWidgets}
    />
  )
}


export const CheckboxWidgetDescription: ComponentStory<typeof Form> = () => {
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


