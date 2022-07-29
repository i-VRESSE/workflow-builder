import { ComponentMeta, ComponentStory } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { screen, userEvent } from '@storybook/testing-library'
import { Form } from './Form'
import { JSONSchema7 } from 'json-schema'
import { IvresseCheckboxWidget } from './IvresseCheckboxWidget'
import { IvresseDescriptionField } from './IvresseDescriptionField'

const meta: ComponentMeta<typeof IvresseCheckboxWidget> = {
  title: 'Checkbox',
  component: IvresseCheckboxWidget
}

export default meta

function render (schema: JSONSchema7, formData = {}): JSX.Element {
  const customWidgets = { CheckboxWidget: IvresseCheckboxWidget }
  const customFields = { DescriptionField: IvresseDescriptionField }
  return (
    <Form
      schema={schema}
      onSubmit={action('onSubmit')}
      widgets={customWidgets}
      fields={customFields}
      formData={formData}
    />
  )
}

export const CheckboxWidgetDescription: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    title: 'Boolean field',
    properties: {
      default: {
        type: 'boolean',
        title: 'checkbox (default)',
        description: 'This is the checkbox-description'
      }
    },
    additionalProperties: false
  }

  return render(schema)
}

const CheckboxArray: ComponentStory<typeof Form> = () => {
  const schema: JSONSchema7 = {
    type: 'object',
    title: 'Array of boolean field',
    properties: {
      array: {
        type: 'array',
        items: {
          type: 'boolean',
          title: 'a checkbox',
          default: false,
          description: 'This is the checkbox-description'
        }
      }
    },
    additionalProperties: false
  }

  return render(schema, { array: [false, true] })
}

export const UncheckedCheckboxInArrayIsSubmiteable = CheckboxArray.bind({})
UncheckedCheckboxInArrayIsSubmiteable.play = async () => {
  await userEvent.click(screen.getByText('Submit'))
}
