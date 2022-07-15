import React, { useEffect } from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { NodePanel } from './NodePanel'
import { Wrapper } from './Wrapper'
import { useSetCatalog, useWorkflow } from './store'
import { prepareCatalog } from './catalog'

const meta: ComponentMeta<typeof NodePanel> = {
  component: NodePanel,
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    )
  ]
}
export default meta

export const NothingSelected: ComponentStory<typeof NodePanel> = () => {
  return <NodePanel />
}

export const GlobalSelected: ComponentStory<typeof NodePanel> = () => {
  const setCatalog = useSetCatalog()
  const { toggleGlobalEdit } = useWorkflow()
  useEffect(() => {
    const catalog = prepareCatalog({
      title: 'Some title',
      categories: [],
      global: {
        schema: {
          type: 'object',
          properties: {
            parameter1: {
              type: 'string'
            }
          },
          additionalProperties: false
        },
        uiSchema: {}
      },
      nodes: [],
      examples: {}
    })
    setCatalog(catalog)
    toggleGlobalEdit()
  }, [])
  return <NodePanel />
}

export const NodeSelected: ComponentStory<typeof NodePanel> = () => {
  const setCatalog = useSetCatalog()
  const { addNodeToWorkflow, selectNode } = useWorkflow()
  useEffect(() => {
    const catalog = prepareCatalog({
      title: 'Some title',
      categories: [{
        name: 'cat1',
        description: ''
      }],
      global: {
        schema: {},
        uiSchema: {}
      },
      nodes: [{
        category: 'cat1',
        description: 'Description of somenode',
        id: 'somenode',
        label: 'Some node',
        schema: {
          type: 'object',
          properties: {
            parameter1: {
              type: 'string'
            }
          },
          additionalProperties: false
        },
        uiSchema: {}
      }],
      examples: {}
    })
    setCatalog(catalog)
    addNodeToWorkflow('somenode')
    selectNode(0)
  }, [])
  return <NodePanel />
}
