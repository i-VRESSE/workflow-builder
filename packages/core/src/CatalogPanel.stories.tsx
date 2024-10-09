
import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import { CatalogPanel } from './CatalogPanel'
import { useSetCatalog } from './store'
import { Wrapper } from './Wrapper'
import { ICatalogNode } from './types'

const meta: ComponentMeta<typeof CatalogPanel> = {
  component: CatalogPanel,
  decorators: [(Story) => (
    <Wrapper>
      <Story />
    </Wrapper>
  )]
}
export default meta

export const Bunch: ComponentStory<typeof CatalogPanel> = () => {
  const setCatalog = useSetCatalog()
  function nodegen (index: number, cat: string): ICatalogNode {
    return {
      category: cat,
      id: `n${index}`,
      label: `Node ${index}`,
      description: `Description of n${index}`,
      schema: {},
      uiSchema: {}
    }
  }
  setCatalog({
    title: 'Some title',
    categories: [{
      name: 'cat1',
      description: 'Description of cat1'
    }, {
      name: 'cat2',
      description: 'Description of cat2'
    }, {
      name: 'cat3',
      description: 'Description of cat3'
    }],
    global: {
      schema: {},
      uiSchema: {}
    },
    nodes: [
      nodegen(1, 'cat1'),
      nodegen(2, 'cat1'),
      nodegen(3, 'cat1'),
      nodegen(4, 'cat2'),
      nodegen(5, 'cat2'),
      nodegen(6, 'cat3')
    ],
    examples: {}
  })
  return <CatalogPanel />
}

export const JustATitle: ComponentStory<typeof CatalogPanel> = () => {
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
  return <CatalogPanel />
}

export const WithChildren: ComponentStory<typeof CatalogPanel> = () => {
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
  return (
    <CatalogPanel>
      <span>Place for info or actions.</span>
    </CatalogPanel>
  )
}

export const WithExample: ComponentStory<typeof CatalogPanel> = () => {
  const setCatalog = useSetCatalog()
  setCatalog({
    title: 'Some title',
    categories: [],
    global: {
      schema: {},
      uiSchema: {}
    },
    nodes: [],
    examples: {
      dummy: '/url-where-example-zip-can-be-found'
    }
  })
  return <CatalogPanel />
}

export const WithNodeLegend: ComponentStory<typeof CatalogPanel> = () => {
  const setCatalog = useSetCatalog()
  setCatalog({
    title: 'Some title',
    nodeLegend: 'My custom node label',
    categories: [],
    global: {
      schema: {},
      uiSchema: {}
    },
    nodes: [],
    examples: {}
  })
  return <CatalogPanel />
}
