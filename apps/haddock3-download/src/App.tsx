import type { PropsWithChildren } from 'react'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { CatalogPanel } from '@i-vresse/wb-core/dist/CatalogPanel'
import { NodePanel } from '@i-vresse/wb-core/dist/NodePanel'
import { WorkflowPanel } from '@i-vresse/wb-core/dist/WorkflowPanel'
import { Header } from '@i-vresse/wb-core/dist/Header'

import { WorkflowDownloadButton } from '@i-vresse/wb-core/dist/WorkflowDownloadButton'
import { WorkflowUploadButton } from '@i-vresse/wb-core/dist/WorkflowUploadButton'
import { WorkflowClear } from '@i-vresse/wb-core/dist/WorkflowClear'
import { FormActions } from '@i-vresse/wb-core/dist/FormActions'
import { Wrapper } from '@i-vresse/wb-core/dist/Wrapper'
import { CatalogPicker } from '@i-vresse/wb-core/dist/CatalogPicker'

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
          <CatalogPanel>
            <CatalogPicker />
          </CatalogPanel>
        </GridArea>
        <GridArea area='workflow'>
          <WorkflowPanel>
            <WorkflowUploadButton />
          </WorkflowPanel>
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
