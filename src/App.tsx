import { RecoilRoot } from 'recoil'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { CatalogPanel } from './CatalogPanel'
import { StepPanel } from './StepPanel'
import { WorkflowPanel } from './WorkflowPanel'
import React from 'react'

function App () {
  return (
    <RecoilRoot>
      <React.Suspense fallback={<div>Loading...</div>}>
        <h1 style={{ height: '1em' }}>i-VRESSE workflow builder</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '400px 0.6fr 1fr', gridAutoRows: '90vh' }}>
          <CatalogPanel />
          <WorkflowPanel />
          <StepPanel />
        </div>
      </React.Suspense>
    </RecoilRoot>
  )
}

export default App
