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
  Wrapper
} from '@i-vresse/wb-core'

import '@i-vresse/wb-form/dist/index.css'
import './App.css'

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
        <GridArea area='workflow' className='workflow-area'>
          <WorkflowPanel>
            <WorkflowDownloadButton />
            <WorkflowUploadButton />
            <WorkflowClear />
          </WorkflowPanel>
        </GridArea>
        <GridArea area='node'>
          <NodePanel />
          <FormActions />
        </GridArea>
      </div>
    </Wrapper>
  )
}

export default App
