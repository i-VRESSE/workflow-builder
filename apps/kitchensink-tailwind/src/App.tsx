import { useEffect } from 'react'
import {
  CatalogPanel,
  FormActions,
  Header,
  NodePanel,
  WorkflowClear,
  WorkflowDownloadButton,
  WorkflowPanel,
  WorkflowUploadButton
} from '@i-vresse/wb-core'
import { useSetCatalog } from '@i-vresse/wb-core/dist/store'
import { prepareCatalog } from '@i-vresse/wb-core/dist/catalog'

import './App.css'
import kitchensinkCatalog from './kitchensink.json'

function App (): JSX.Element {
  const setCatalog = useSetCatalog()
  useEffect(() => {
    const catalog = prepareCatalog(kitchensinkCatalog)
    setCatalog(catalog)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className='grid grid-cols-3'>
      <div className="col-span-3 text-2xl pb-2">
        <Header />
      </div>
      <div className='row-span-2'>
        <CatalogPanel />
      </div>
      <div>
        <WorkflowPanel>
          <WorkflowUploadButton />
        </WorkflowPanel>
      </div>
      <div>
        <NodePanel />
      </div>
      <div>
        <WorkflowDownloadButton />
        <WorkflowClear />
      </div>
      <div>
        <FormActions />
      </div>
    </div>
  )
}

export default App
