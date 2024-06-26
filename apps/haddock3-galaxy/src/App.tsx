import 'bootstrap/dist/css/bootstrap.min.css'
import {
  CatalogPanel,
  FormActions,
  GridArea,
  Header,
  NodePanel,
  CatalogPicker,
  WorkflowClear,
  WorkflowPanel
} from '@i-vresse/wb-core'
import './App.css'
import '@i-vresse/wb-form/dist/index.css'
import { WorkflowSubmitButton } from './WorkflowSubmitButton'
import originalCatalogIndexURL from '../public/catalog/index.json'
import { useAutosaveValue, useCatalog, useSetAutosave, useSetCatalog, useWorkflow } from '@i-vresse/wb-core/dist/store'
import { useEffect } from 'react'
import { toast } from 'react-toastify'

// Catalog index need prepended baseUrl
// Items in index need prepended baseUrl
const baseUrl = '/static/plugins/visualizations/haddock3/static'
const catalogIndexURL = `data:application/json,${JSON.stringify(
  originalCatalogIndexURL.map(c => [c[0], baseUrl + c[1]]).reverse()
  // reverse to load guru catalog by default (as it now is first entry) so example zip file is compliant
)}`

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

function App (): JSX.Element {
  // Examples URLS need to prepended baseUrl
  const catalog = useCatalog()
  const autosave = useAutosaveValue()
  const setCatalog = useSetCatalog()
  const { loadWorkflowArchive } = useWorkflow()

  useEffect(() => {
    if (catalog.title !== '') {
      let touched = false
      const examples = Object.fromEntries(
        Object.entries(catalog.examples).map(([k, v]) => {
          if (!v.startsWith(baseUrl)) {
            touched = true
            return [k, baseUrl + v]
          }
          return [k, v]
        }))
      if (touched) {
        setCatalog({ ...catalog, examples })
        // Load from dataset
        addDatasetToBuilder(loadWorkflowArchive).catch((e) => console.error(e))
      }
    }
  }, [catalog])
  // TODO pick datasets from galaxy history like in https://github.com/i-VRESSE/jupyterlab-haddock3-configurator
  return (
    <div className='page'>
      <GridArea area='head'>
        <Header />
      </GridArea>
      <GridArea area='catalog'>
        <CatalogPanel>
          <CatalogPicker catalogIndexURL={catalogIndexURL} />
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

async function addDatasetToBuilder (loadWorkflowArchive: (archiveURL: string) => Promise<void>): Promise<void> {
  const params = new URLSearchParams(document.location.search)
  const datasetId = params.get('dataset_id')
  if (datasetId !== null) {
    // TODO load dataset as an workflow archive
    const url = `/api/datasets/${datasetId}/display?to_ext=zip`
    await loadWorkflowArchive(url)
    // TODO loadWorkflowArchive expects workflow.cfg file, which could be missing in zip
    toast('Dataset loaded')
  }
}
