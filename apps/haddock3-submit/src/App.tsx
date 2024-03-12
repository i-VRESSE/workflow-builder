import 'bootstrap/dist/css/bootstrap.min.css'
import {
  CatalogPanel,
  FormActions,
  GridArea,
  Header,
  NodePanel,
  CatalogPicker,
  WorkflowClear,
  Wrapper,
  WorkflowPanel
} from '@i-vresse/wb-core'
import './App.css'
import '@i-vresse/wb-form/dist/index.css'
import { WorkflowSubmitButton } from './WorkflowSubmitButton'

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
          <WorkflowPanel />
        </GridArea>
        <GridArea area='node'>
          <NodePanel />
        </GridArea>
        <GridArea className='action-row' area='workflow-actions'>
          <WorkflowSubmitButton />
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
