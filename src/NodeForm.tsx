import { useFiles, useSelectedCatalogNode, useSelectedNode, useSelectNodeIndex, useWorkflow } from './store'
import { internalizeDataUrls } from './dataurls'
import { Form } from './Form'

export const NodeForm = (): JSX.Element => {
  // TODO move setParameters to useSelectedNode
  const index = useSelectNodeIndex()
  const { setNodeParameters, deleteNode } = useWorkflow()
  const files = useFiles()
  const node = useSelectedNode()
  const catalogNode = useSelectedCatalogNode()

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
      <Form schema={catalogNode.schema} uiSchema={uiSchema} formData={parametersWithDataUrls} onSubmit={({ formData }) => setNodeParameters(formData)} />
      <button className='btn btn-light btn-sm' title='Remove' onClick={() => deleteNode(index)}>Delete</button>
    </>
  )
}
