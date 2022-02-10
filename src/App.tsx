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
import { WorkflowDownloadButton } from './WorkflowDownloadButton'
import { FormActions } from './FormActions'

function App (): JSX.Element {
  return (
    <RecoilRoot>
      <DndProvider backend={HTML5Backend}>
        <ErrorBoundary>
          <React.Suspense fallback={<div>Loading...</div>}>
            <ToastContainer position='top-center' autoClose={1000} closeOnClick pauseOnFocusLoss />
            <div className='page'>
              <div style={{ gridArea: 'head' }}>
                <Header />
              </div>
              <div style={{ gridArea: 'catalog' }}>
                <CatalogPanel />
              </div>
              <div style={{ gridArea: 'workflow' }}>
                <WorkflowPanel />
              </div>
              <div style={{ gridArea: 'node' }}>
                <NodePanel />
              </div>
              <div className='action-row' style={{ gridArea: 'workflow-actions' }}>
                <WorkflowDownloadButton />
              </div>
              <div className='action-row' style={{ gridArea: 'node-actions' }}>
                <FormActions />
              </div>
            </div>
          </React.Suspense>
        </ErrorBoundary>
      </DndProvider>
    </RecoilRoot>
  )
}

export default App
