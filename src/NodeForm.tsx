import { useSetRecoilState } from 'recoil'
import { activeSubmitButtonState, useFiles, useSelectedCatalogNode, useSelectedNode, useWorkflow } from './store'
import { internalizeDataUrls } from './dataurls'
import { Form } from './Form'
import { groupParameters } from './grouper'

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
  const formData = groupParameters(internalizeDataUrls(node.parameters, files), catalogNode.uiSchema)

  const uiSchema = (catalogNode?.formUiSchema != null) ? catalogNode.formUiSchema : {}
  return (
    <>
      <h4>{catalogNode.label} ({node.id})</h4>
      <div>
        {catalogNode.description}
      </div>
      <Form
        schema={catalogNode.formSchema ?? {}}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={({ formData }) => setNodeParameters(formData)}
      >
        <button ref={submitFormRefSetter} style={{ display: 'none' }} />
      </Form>
    </>
  )
}
