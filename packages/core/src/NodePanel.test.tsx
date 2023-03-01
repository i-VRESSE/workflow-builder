import React, { useEffect, Suspense } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { RecoilRoot } from 'recoil'
import { it, describe, expect, vi, afterEach, beforeEach } from 'vitest'
import { prepareCatalog } from './catalog'
import { useSetCatalog, useWorkflow } from './store'
import { NodePanel } from './NodePanel'

/**
 * @vitest-environment jsdom
 */

afterEach(cleanup)

describe('<NodePanel/>', () => {
  describe('given selected node with custom widget and field', () => {
    beforeEach(async () => {
      const fields = {
        mystringfield: () => <span>My string field</span>
      }
      const widgets = {
        mystringwidget: () => <span>My string widget</span>
      }
      const StoreContext: React.FC<{}> = ({ children }) => {
        const setCatalog = useSetCatalog()
        const { addNodeToWorkflow, selectNode } = useWorkflow()
        useEffect(() => {
          const catalog = prepareCatalog({
            title: 'Some title',
            categories: [
              {
                name: 'cat1',
                description: ''
              }
            ],
            global: {
              schema: {},
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
                    parameter1: {
                      type: 'string'
                    },
                    parameter2: {
                      type: 'string'
                    }
                  }
                },
                uiSchema: {
                  parameter1: {
                    'ui:field': 'mystringfield'
                  },
                  parameter2: {
                    'ui:widget': 'mystringwidget'
                  }
                }
              }
            ],
            examples: {}
          })
          setCatalog(catalog)
          addNodeToWorkflow('somenode')
          selectNode(0)
        }, [])
        return (
          <Suspense fallback={<span>busy</span>}>{children}</Suspense>
        )
      }

      vi.useFakeTimers()

      render(
        <StoreContext>
          <NodePanel fields={fields} widgets={widgets} />
        </StoreContext>,
        { wrapper: RecoilRoot }
      )

      // To let recoil async finish use a 100ms timeout
      // Taken from https://recoiljs.org/docs/guides/testing/#testing-recoil-state-with-asynchronous-queries-inside-of-a-react-component
      async function flushPromisesAndTimers (): Promise<void> {
        return await act(
          async () =>
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
              vi.runAllTimers()
            })
        )
      }

      await flushPromisesAndTimers()
    })

    it('should render custom field', () => {
      expect(screen.getByText('My string field')).toBeTruthy()
    })

    it('should render custom widget', () => {
      expect(screen.getByText('My string widget')).toBeTruthy()
    })
  })

  describe('given global parameters selected with custom widget and field', () => {
    beforeEach(async () => {
      const fields = {
        mystringfield: () => <span>My string field</span>
      }
      const widgets = {
        mystringwidget: () => <span>My string widget</span>
      }
      const StoreContext: React.FC<{}> = ({ children }) => {
        const setCatalog = useSetCatalog()
        useEffect(() => {
          const catalog = prepareCatalog({
            title: 'Some title',
            categories: [
              {
                name: 'cat1',
                description: ''
              }
            ],
            global: {
              schema: {
                type: 'object',
                properties: {
                  parameter1: {
                    type: 'string'
                  },
                  parameter2: {
                    type: 'string'
                  }
                }
              },
              uiSchema: {
                parameter1: {
                  'ui:field': 'mystringfield'
                },
                parameter2: {
                  'ui:widget': 'mystringwidget'
                }
              }
            },
            nodes: [],
            examples: {}
          })
          setCatalog(catalog)
        }, [])
        return (
          <Suspense fallback={<span>busy</span>}>{children}</Suspense>
        )
      }

      vi.useFakeTimers()

      render(
        <StoreContext>
          <NodePanel fields={fields} widgets={widgets} />
        </StoreContext>,
        { wrapper: RecoilRoot }
      )

      // To let recoil async finish use a 100ms timeout
      // Taken from https://recoiljs.org/docs/guides/testing/#testing-recoil-state-with-asynchronous-queries-inside-of-a-react-component
      async function flushPromisesAndTimers (): Promise<void> {
        return await act(
          async () =>
            await new Promise((resolve) => {
              setTimeout(resolve, 100)
              vi.runAllTimers()
            })
        )
      }

      await flushPromisesAndTimers()
    })

    it('should render custom field', () => {
      expect(screen.getByText('My string field')).toBeTruthy()
    })

    it('should render custom widget', () => {
      expect(screen.getByText('My string widget')).toBeTruthy()
    })
  })
})
