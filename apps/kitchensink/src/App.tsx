import { useEffect } from 'react'
import {
  CatalogPanel,
  FormActions,
  GridArea,
  Header,
  NodePanel,
  WorkflowClear,
  WorkflowDownloadButton,
  WorkflowPanel,
  WorkflowUploadButton
} from '@i-vresse/wb-core'
import { useSetCatalog } from '@i-vresse/wb-core/dist/store'
import { prepareCatalog } from '@i-vresse/wb-core/dist/catalog'

import 'bootstrap/dist/css/bootstrap.min.css'
import '@i-vresse/wb-form/dist/index.css'
import './App.css'
import kitchensinkCatalog from './kitchensink.json'

function App (): JSX.Element {
  const setCatalog = useSetCatalog()
  useEffect(() => {
    const catalog = prepareCatalog(kitchensinkCatalog)
    setCatalog(catalog)
  }, [])
  return (
    <div className='page'>
      <GridArea area='head'>
        <Header />
      </GridArea>
      <GridArea area='catalog'>
        <CatalogPanel />
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
  )
}

export default App
