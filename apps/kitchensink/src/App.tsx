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
import { useAutosaveValue, useSetAutosave, useSetCatalog } from '@i-vresse/wb-core/dist/store'
import { prepareCatalog } from '@i-vresse/wb-core/dist/catalog'

import 'bootstrap/dist/css/bootstrap.min.css'
import '@i-vresse/wb-form/dist/index.css'
import './App.css'
import kitchensinkCatalog from './kitchensink.json'

function AutosaveManagement(): JSX.Element {
  const autosave = useAutosaveValue()
  const setAutosave = useSetAutosave()

  return (
    <div
      className='form-group form-check'
    >
      <input
        type='checkbox'
        className='form-check-input'
        id='autosave'
        checked={autosave}
        onChange={(e) => {
          setAutosave(!autosave)
        }}
      />
      <label
        className='form-check-label'
        htmlFor='autosave'
      >
        Autosave
      </label>
    </div>
  )
}


function App(): JSX.Element {
  const setCatalog = useSetCatalog()
  const autosave = useAutosaveValue()

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
      <GridArea area='workflow' className='workflow-area'>
        <WorkflowPanel>
          <WorkflowDownloadButton />
          <WorkflowUploadButton />
          <WorkflowClear />
          <AutosaveManagement />
        </WorkflowPanel>
      </GridArea>
      <GridArea area='node'>
        <NodePanel />
        {/* show form actions if autosave is OFF */}
        {!autosave ? <FormActions /> : null}
      </GridArea>
      {/* <GridArea className='action-row' area='workflow-actions'>
        <WorkflowDownloadButton />
        <WorkflowClear />
      </GridArea>
      <GridArea className='action-row' area='node-actions'>
        <FormActions />
      </GridArea> */}
    </div>
  )
}

export default App
