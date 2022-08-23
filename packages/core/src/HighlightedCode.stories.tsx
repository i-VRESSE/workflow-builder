import { HighlightedCode } from './HighlightedCode'
import { ComponentMeta, ComponentStory } from '@storybook/react'

const story: ComponentMeta<typeof HighlightedCode> = {
  title: 'HighlightedCode',
  component: HighlightedCode
}

export default story

const Template: ComponentStory<typeof HighlightedCode> = (args) => <HighlightedCode {...args} />

export const FirstStory = Template.bind({})

FirstStory.args = {
  code: `
prop1 = 'xx'
prop3 = 'cc'
prop2 = 'vv'

[node1]

prop1 = 'a'
prop3 = 'b'
prop2 = 'x'
`
}
