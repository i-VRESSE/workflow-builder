import React from 'react'
import { RecoilRoot } from 'recoil'
import { DnDWrapper } from './DndWrapper'
import { ErrorBoundary } from './ErrorBoundary'

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
