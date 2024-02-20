import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Form } from './Form'
import validator from '@rjsf/validator-ajv8'

const meta: ComponentMeta<typeof Form> = {
  component: Form,
  argTypes: { onSubmit: { action: 'submitted' } }
}
export default meta

const Template: ComponentStory<typeof Form> = (args) => <Form {...args} validator={validator}/>

export const File = Template.bind({})

File.args = {
  schema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        format: 'uri-reference'
      }
    },
    additionalProperties: false
  },
  uiSchema: {
    param1: {
      'ui:widget': 'file'
    }
  }
}
