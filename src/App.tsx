import React from 'react'
import { RecoilRoot } from 'recoil'
import 'bootstrap/dist/css/bootstrap.min.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import './App.css'
import { CatalogPanel } from './CatalogPanel'
import { NodePanel } from './NodePanel'
import { WorkflowPanel } from './WorkflowPanel'
import { Header } from './Header'
import { ErrorBoundary } from './ErrorBoundary'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

function App (): JSX.Element {
  return (
    <RecoilRoot>
      <DndProvider backend={HTML5Backend}>
        <ErrorBoundary>
          <React.Suspense fallback={<div>Loading...</div>}>
            <ToastContainer position='top-center' autoClose={1000} closeOnClick pauseOnFocusLoss />
            <Header />
            <div style={{ display: 'grid', gridTemplateColumns: '400px 0.6fr 1fr', gridAutoRows: '90vh', columnGap: '0.5em' }}>
              <CatalogPanel />
              <WorkflowPanel />
              <NodePanel />
            </div>
          </React.Suspense>
        </ErrorBoundary>
      </DndProvider>
    </RecoilRoot>
  )
}

export default App
