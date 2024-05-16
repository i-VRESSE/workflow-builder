import {
  CatalogPanel,
  CatalogPicker,
  FormActions,
  GridArea,
  Header,
  NodePanel,
  WorkflowClear,
  WorkflowDownloadButton,
  WorkflowPanel,
  WorkflowUploadButton,
  Wrapper,
  useAutosaveValue,
  useSetAutosave
} from '@i-vresse/wb-core'

import '@i-vresse/wb-form/dist/index.css'
import './App.css'

function AutosaveManagement (): JSX.Element {
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

function PageContent (): JSX.Element {
  const autosave = useAutosaveValue()

  return (
    <div className='page'>
      <GridArea area='head'>
        <Header />
      </GridArea>
      <GridArea area='catalog'>
        <CatalogPanel>
          <CatalogPicker />
        </CatalogPanel>
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
    </div>
  )
}

function App (): JSX.Element {
  return (
    <Wrapper>
      <PageContent />
    </Wrapper>
  )
}

export default App
