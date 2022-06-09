import { useSetActiveSubmitButton, useSelectedCatalogNode, useSelectedNode, useSelectedNodeFormData, useSelectedNodeFormSchema } from './store'
import { Form } from './Form'

export const NodeForm = (): JSX.Element => {
  // TODO move setNodeParameters to useSelectedNode
  const [formData, setFormData] = useSelectedNodeFormData()
  const node = useSelectedNode()
  const catalogNode = useSelectedCatalogNode()
  const schema = useSelectedNodeFormSchema() ?? {}
  const submitFormRefSetter = useSetActiveSubmitButton()

  if (node === undefined) {
    return <div>No node selected</div>
  }
  if (catalogNode === undefined) {
    return <div>Unable to find schema belonging to node</div>
  }

  const uiSchema = catalogNode.formUiSchema
  return (
    <>
      <h4>{catalogNode.label} ({node.id})</h4>
      <div style={{ marginBottom: '20px' }}>
        {catalogNode.description}
      </div>
      <Form
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={({ formData }) => setFormData(formData)}
      >
        <button ref={submitFormRefSetter} style={{ display: 'none' }} />
      </Form>
    </>
  )
}
