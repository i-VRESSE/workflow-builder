import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Header } from './Header';
import { useSetCatalog } from './store';
import { Wrapper } from './Wrapper';

export default {
  component: Header,
  decorators: [(Story) => (
    <Wrapper>
      <Story/>
    </Wrapper>
  )]
} as ComponentMeta<typeof Header>;

export const Default: ComponentStory<typeof Header> = () => {
  const setCatalog = useSetCatalog()
  setCatalog({
    title: 'Some title',
    categories: [],
    global: {
      schema: {},
      uiSchema: {}
    },
    nodes: [],
    examples: {}
  })
  return <Header/>
}