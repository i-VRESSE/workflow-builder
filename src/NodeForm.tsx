import { useSetRecoilState } from 'recoil'
import { activeSubmitButtonState, useFiles, useSelectedCatalogNode, useSelectedNode, useWorkflow } from './store'
import { internalizeDataUrls } from './dataurls'
import { Form } from './Form'

export const NodeForm = (): JSX.Element => {
  // TODO move setNodeParameters to useSelectedNode
  const { setNodeParameters } = useWorkflow()
  const files = useFiles()
  const node = useSelectedNode()
  const catalogNode = useSelectedCatalogNode()
  const submitFormRefSetter = useSetRecoilState(activeSubmitButtonState) as (instance: HTMLButtonElement | null) => void

  if (node === undefined) {
    return <div>No node selected</div>
  }
  if (catalogNode === undefined) {
    return <div>Unable to find schema belonging to node</div>
  }
  const parametersWithDataUrls = internalizeDataUrls(node.parameters, files)

  const uiSchema = (catalogNode?.uiSchema != null) ? catalogNode.uiSchema : {}
  return (
    <>
      <h4>{catalogNode.label} ({node.id})</h4>
      <div>
        {catalogNode.description}
      </div>
      <Form
        schema={catalogNode.schema}
        uiSchema={uiSchema}
        formData={parametersWithDataUrls}
        onSubmit={({ formData }) => setNodeParameters(formData)}
      >
        <button ref={submitFormRefSetter} style={{ display: 'none' }} />
      </Form>
    </>
  )
}
