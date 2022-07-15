import { ComponentMeta, ComponentStory } from '@storybook/react'
import { CatalogPickerComponent } from './CatalogPicker.component'

const meta: ComponentMeta<typeof CatalogPickerComponent> = {
  component: CatalogPickerComponent
}
export default meta

const Template: ComponentStory<typeof CatalogPickerComponent> = (args) => (
  <CatalogPickerComponent {...args} />
)

export const FirstSelected = Template.bind({})

FirstSelected.args = {
  index: [
    ['cat1', 'data:bla1'],
    ['cat2', 'data:bla2'],
    ['cat3', 'data:bla3']
  ],
  selected: 'data:bla1'
}
