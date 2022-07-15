import React, { useEffect } from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { WorkflowUploadButton } from './WorkflowUploadButton'
import { Wrapper } from './Wrapper'
import { useGlobalFormData, useSetCatalog } from './store'
import { prepareCatalog } from './catalog'
import 'bootstrap/dist/css/bootstrap.min.css'

const meta: ComponentMeta<typeof WorkflowUploadButton> = {
  component: WorkflowUploadButton,
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    )
  ]
}
export default meta

export const FilledWorkflowWithString: ComponentStory<
  typeof WorkflowUploadButton
> = () => {
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
  return <WorkflowUploadButton />
}
