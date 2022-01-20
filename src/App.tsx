import { RecoilRoot } from 'recoil'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { CatalogPanel } from './CatalogPanel'
import { StepPanel } from './StepPanel'
import { WorkflowPanel } from './WorkflowPanel'
import React from 'react'
import { Header } from './Header'

function App () {
  return (
    <RecoilRoot>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Header/>
        <div style={{ display: 'grid', gridTemplateColumns: '400px 0.6fr 1fr', gridAutoRows: '90vh', columnGap: '0.5em' }}>
          <CatalogPanel />
          <WorkflowPanel />
          <StepPanel />
        </div>
      </React.Suspense>
    </RecoilRoot>
  )
}

export default App
