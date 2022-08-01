import { useEffect } from 'react'

import { ComponentMeta, ComponentStory } from '@storybook/react'
import { prepareCatalog } from './catalog'
import { CatalogPanel, FormActions, NodePanel, WorkflowPanel, WorkflowUploadButton, Wrapper } from './index'
import { useSetCatalog } from './store'
import { ICatalog } from './types'

import '@i-vresse/wb-form/dist/index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

const meta: ComponentMeta<typeof WorkflowUploadButton> = {
  component: Wrapper,
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    )
  ]
}
export default meta

export const ExampleApp: ComponentStory<typeof Wrapper> = () => {
  const setCatalog = useSetCatalog()
  useEffect(() => {
    const catalog: ICatalog = {
      title: 'Some title',
      categories: [
        {
          name: 'cat1',
          description: 'First category'
        }
      ],
      global: {
        schema: {
          type: 'object',
          properties: {
            parameterY: {
              type: 'string'
            }
          }
        },
        uiSchema: {}
      },
      nodes: [
        {
          category: 'cat1',
          description: 'Description of somenode',
          id: 'somenode',
          label: 'Some node',
          schema: {
            type: 'object',
            properties: {
              parameterX: {
                type: 'string'
              }
            }
          },
          uiSchema: {}
        }
      ],
      examples: {}
    }
    setCatalog(prepareCatalog(catalog)) // On mount configure catalog
  }, [])
  return (
    <table>
      <tr>
        <td>
          <CatalogPanel />
        </td>
        <td>
          <WorkflowPanel />
        </td>
        <td style={{ verticalAlign: 'top' }}>
          <NodePanel />
          <FormActions />
        </td>
      </tr>
    </table>
  )
}
