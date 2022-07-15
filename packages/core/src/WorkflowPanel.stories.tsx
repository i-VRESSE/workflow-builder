import React, { useEffect } from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { WorkflowPanel } from './WorkflowPanel'
import { Wrapper } from './Wrapper'
import { useGlobalFormData, useSetCatalog, useWorkflow } from './store'
import { prepareCatalog } from './catalog'
import 'bootstrap/dist/css/bootstrap.min.css'
import { ICatalogNode } from './types'

const meta: ComponentMeta<typeof WorkflowPanel> = {
  component: WorkflowPanel,
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    )
  ]
}
export default meta

export const Empty: ComponentStory<typeof WorkflowPanel> = () => {
  return <WorkflowPanel />
}

export const GlobalParameters: ComponentStory<typeof WorkflowPanel> = () => {
  const setCatalog = useSetCatalog()
  const setGlobalFormData = useGlobalFormData()[1]
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
    setGlobalFormData({ parameter1: 'some value' })
  }, [])
  return <WorkflowPanel />
}

export const SomeNodes: ComponentStory<typeof WorkflowPanel> = () => {
  const setCatalog = useSetCatalog()
  const { addNodeToWorkflow } = useWorkflow()
  useEffect(() => {
    function nodegen (index: number): ICatalogNode {
      return {
        category: 'cat1',
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
      }],
      global: {
        schema: {},
        uiSchema: {}
      },
      nodes: [
        nodegen(1),
        nodegen(2),
        nodegen(3),
        nodegen(4)
      ],
      examples: {}
    })
    addNodeToWorkflow('n1')
    addNodeToWorkflow('n2')
    addNodeToWorkflow('n3')
    addNodeToWorkflow('n4')
  }, [])
  return <WorkflowPanel />
}
