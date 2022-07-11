import React from 'react'
import { RecoilRoot } from 'recoil'
import { DnDWrapper } from './DndWrapper'
import { ErrorBoundary } from './ErrorBoundary'

/**
 * Wrapper around app which initializes recoil and dndkit
 * 
 * @param children
 */
export const Wrapper = ({ children }: React.PropsWithChildren<{}>): JSX.Element => {
  return (
    <RecoilRoot>
      <ErrorBoundary>
        <React.Suspense fallback={<div>Loading...</div>}>
          <DnDWrapper>
            {children}
          </DnDWrapper>
        </React.Suspense>
      </ErrorBoundary>
    </RecoilRoot>
  )
}
