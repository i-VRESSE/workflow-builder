import React from 'react'
import { Form } from '@i-vresse/wb-form'
import { useSetActiveSubmitButton, useSelectedCatalogNode, useSelectedNode, useSelectedNodeFormData, useSelectedNodeFormSchema, useSelectedNodeFormUiSchema } from './store'
import '@i-vresse/wb-form/dist/index.css'

export const NodeForm = (): JSX.Element => {
  const [formData, setFormData] = useSelectedNodeFormData()
  const node = useSelectedNode()
  const catalogNode = useSelectedCatalogNode()
  const schema = useSelectedNodeFormSchema() ?? {}
  const submitFormRefSetter = useSetActiveSubmitButton()
  const uiSchema = useSelectedNodeFormUiSchema() ?? {}
  if (node === undefined) {
    return <div>No node selected</div>
  }
  if (catalogNode === undefined) {
    return <div>Unable to find schema belonging to node</div>
  }

  return (
    <>
      <h4>{catalogNode.label} ({node.type})</h4>
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
