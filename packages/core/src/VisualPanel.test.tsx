import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { VisualPanel } from './VisualPanel'
import { Wrapper } from './Wrapper'

/**
 * @vitest-environment jsdom
 */

afterEach(cleanup)

describe('<VisualPanel/>', () => {
  describe('given empty workflow', () => {
    it('should render text how to add node', async () => {
      render(<VisualPanel />, { wrapper: Wrapper })

      const appendZone = await screen.findByText(/Append node to workflow by/)
      expect(appendZone).toBeTruthy()
    })
  })
})
