import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react-hooks'
import { useSelectNodeIndex } from './store'
import { RecoilRoot } from 'recoil'

/**
 * @vitest-environment jsdom
 */

describe('useSelectNodeIndex()', () => {
  it('should have -1 as initial value', () => {
    const { result } = renderHook(useSelectNodeIndex, {
      wrapper: RecoilRoot
    })

    expect(result.current).toEqual(-1)
  })
})
