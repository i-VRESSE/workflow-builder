import { afterEach, describe, expect, it } from 'vitest'
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

describe('useSelectNodeIndex()', () => {
  it('should have -1 as initial value', () => {
    const { result } = renderHook(useSelectNodeIndex, {
      wrapper: RecoilRoot
    })

    expect(result.current).toEqual(-1)
  })
})

describe('useText()', () => {
  describe('given empty catalog, no nodes and no global parameters', () => {
    it('should return default state with empty molecules array', () => {
      const { result } = renderHook(useText, {
        wrapper: RecoilRoot
      })
      // clean text from returns (\n)
      const text = result.current.replaceAll('\n', '')
      expect(text).toEqual('')
    })
  })

  describe('given catalog and a global parameter', () => {
    it('should return global parameter as TOML formatted string', () => {
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

      const expected = `
parameterX = 'some value'
`
      expect(result.current.text).toEqual(expected)
    })
  })
})

describe('useSelectedCatalogNode()', () => {
  describe('given catalog and workflow with single node', () => {
    it('should return catalog of selected node', () => {
      const { result } = renderHook(
        () => {
          // TODO be able to use hooks with have async code
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
