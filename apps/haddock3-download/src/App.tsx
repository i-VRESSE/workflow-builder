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
import 'bootstrap/dist/css/bootstrap.min.css'
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
