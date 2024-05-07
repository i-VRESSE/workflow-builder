import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react-hooks'
import {
  useGlobalFormData,
  useSelectedCatalogNode,
  useSelectNodeIndex,
  useSetCatalog,
  useText,
  useWorkflow
} from './store'
import { RecoilRoot } from 'recoil'
import { prepareCatalog } from './catalog'

/**
 * @vitest-environment jsdom
 */

afterEach(cleanup)

async function flushPromisesAndTimers (): Promise<void> {
  return await act(
    async () =>
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
        vi.runAllTimers()
      })
  )
}

describe('useSelectNodeIndex()', () => {
  it('should have -1 as initial value', () => {
    const { result } = renderHook(useSelectNodeIndex, {
      wrapper: RecoilRoot
    })

    expect(result.current).toEqual(-1)
  })
})

describe('useText()', () => {
  describe('given catalog and a global parameter', () => {
    it('should return global parameter as TOML formatted string', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(
        () => {
          // Custom hook to return hook under test and other hooks to fill global state
          const text = useText()
          const setCatalog = useSetCatalog()
          const setGlobalFormData = useGlobalFormData()[1]

          return {
            text,
            setCatalog,
            setGlobalFormData
          }
        },
        {
          wrapper: RecoilRoot
        }
      )

      await flushPromisesAndTimers()

      act(() => {
        // Fill global state
        const catalog = {
          title: 'Some title',
          categories: [],
          global: {
            schema: {
              type: 'object',
              properties: {
                parameterX: {
                  type: 'string'
                }
              }
            },
            uiSchema: {}
          },
          nodes: [],
          examples: {}
        }
        result.current.setCatalog(prepareCatalog(catalog))
        result.current.setGlobalFormData({
          parameterX: 'some value'
        })
      })

      await flushPromisesAndTimers()

      const expected = `
parameterX = 'some value'
`
      expect(result.current.text).toEqual(expected)
    })
  })
})

describe('useSelectedCatalogNode()', () => {
  describe('given catalog and workflow with single node', () => {
    it('should return catalog of selected node', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(
        () => {
          const catalogNode = useSelectedCatalogNode()
          const setCatalog = useSetCatalog()
          const { addNodeToWorkflow, selectNode } = useWorkflow()
          return {
            catalogNode,
            setCatalog,
            addNodeToWorkflow,
            selectNode
          }
        },
        {
          wrapper: RecoilRoot
        }
      )

      act(() => {
        // Fill global state
        const catalog = {
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
              properties: {}
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
        const c = result.current
        c.setCatalog(prepareCatalog(catalog))
        c.addNodeToWorkflow('somenode')
        c.selectNode(0)
      })

      await flushPromisesAndTimers()

      const expected = {
        type: 'object',
        properties: {
          parameterX: {
            type: 'string'
          }
        }
      }
      const c = result.current
      expect(c.catalogNode?.formSchema).toEqual(expected)
    })
  })
})
