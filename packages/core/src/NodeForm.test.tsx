import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { RecoilRoot } from 'recoil'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { NodeForm } from './NodeForm'

/**
 * @vitest-environment jsdom
 */

afterEach(cleanup)

describe('<NodeForm/>', () => {
  describe('given no node is selected', () => {
    beforeEach(() => {
      render(<NodeForm />, { wrapper: RecoilRoot })
    })

    it('should render no node selected', () => {
      expect(screen.getByText('No node selected')).toBeTruthy()
    })
  })
})
