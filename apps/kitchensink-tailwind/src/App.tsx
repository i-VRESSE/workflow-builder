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
    <div className='page grid h-screen w-full gap-2 p-4'>
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
      <GridArea className='p-1' area='workflow-actions'>
        <WorkflowDownloadButton />
        <WorkflowClear />
      </GridArea>
      <GridArea className='p-1' area='node-actions'>
        <FormActions />
      </GridArea>
    </div>
  )
}

export default App
