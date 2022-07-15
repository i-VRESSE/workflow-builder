import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Form } from "./Form";

const meta: ComponentMeta<typeof Form> = {
  component: Form,
  argTypes: { onSubmit: { action: 'submitted'}}
};
export default meta;

const Template: ComponentStory<typeof Form> = (args) => <Form {...args} />;

export const File = Template.bind({});

File.args = {
  schema: {
    type: "object",
    properties: {
      param1: {
        type: "string",
        format: 'uri-reference'
      }
    },
    additionalProperties: false,
  },
  uiSchema: {
    param1: {
        "ui:widget": "file"
    }
  }
};
