import type { PropsWithChildren } from 'react'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { CatalogPanel } from './CatalogPanel'
import { NodePanel } from './NodePanel'
import { WorkflowPanel } from './WorkflowPanel'
import { Header } from './Header'

import { WorkflowDownloadButton } from './WorkflowDownloadButton'
import { WorkflowClear } from './WorkflowClear'
import { FormActions } from './FormActions'
import { Wrapper } from './Wrapper'

function GridArea ({ area, className, children }: PropsWithChildren<{area: string, className?: string}>): JSX.Element {
  return (
    <div className={className} style={{ gridArea: area }}>
      {children}
    </div>
  )
}

function App (): JSX.Element {
  return (
    <Wrapper>
      <div className='page'>
        <GridArea area='head'>
          <Header />
        </GridArea>
        <GridArea area='catalog'>
          <CatalogPanel />
        </GridArea>
        <GridArea area='workflow'>
          <WorkflowPanel />
        </GridArea>
        <GridArea area='node'>
          <NodePanel />
        </GridArea>
        <GridArea className='action-row' area='workflow-actions'>
          <WorkflowDownloadButton />
          <WorkflowClear />
        </GridArea>
        <GridArea className='action-row' area='node-actions'>
          <FormActions />
        </GridArea>
      </div>
    </Wrapper>
  )
}

export default App
