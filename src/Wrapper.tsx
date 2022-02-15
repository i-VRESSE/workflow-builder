import React from 'react'
import { RecoilRoot } from 'recoil'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ErrorBoundary } from './ErrorBoundary'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

export const Wrapper = ({ children }: React.PropsWithChildren<{}>): JSX.Element => {
  return (
    <RecoilRoot>
      <DndProvider backend={HTML5Backend}>
        <ErrorBoundary>
          <React.Suspense fallback={<div>Loading...</div>}>
            <ToastContainer position='top-center' autoClose={1000} closeOnClick pauseOnFocusLoss />
            {children}
          </React.Suspense>
        </ErrorBoundary>
      </DndProvider>
    </RecoilRoot>
  )
}
