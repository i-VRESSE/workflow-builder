import 'bootstrap/dist/css/bootstrap.min.css'
import {
  CatalogPanel,
  FormActions,
  GridArea,
  Header,
  NodePanel,
  CatalogPicker,
  WorkflowClear,
  WorkflowPanel,
  useAutosaveValue,
  useSetAutosave
} from '@i-vresse/wb-core'
import './App.css'
import '@i-vresse/wb-form/dist/index.css'
import { WorkflowSubmitButton } from './WorkflowSubmitButton'

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
          <WorkflowSubmitButton />
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

export default App
