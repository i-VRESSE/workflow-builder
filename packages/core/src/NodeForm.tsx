import React from 'react'
import { Form } from '@i-vresse/wb-form'

// import { FormProps } from './FormProps'
import { useSelectedCatalogNode, useSelectedNode, useSelectedNodeFormData, useSelectedNodeFormSchema, useSelectedNodeFormUiSchema, useSetActiveSubmitButton } from './store'
import validator from '@rjsf/validator-ajv8'

import '@i-vresse/wb-form/dist/index.css'

export const NodeForm = ({ fields, widgets }: any): JSX.Element => {
  const [formData, setFormData] = useSelectedNodeFormData()
  const node = useSelectedNode()
  const catalogNode = useSelectedCatalogNode()
  const schema = useSelectedNodeFormSchema() ?? {}
  const submitFormRefSetter = useSetActiveSubmitButton()
  const uiSchema = useSelectedNodeFormUiSchema() ?? {}

  console.group('NodeForm')
  console.log('fields...', fields)
  console.log('widgets...', widgets)
  console.log('schema...', schema)
  console.log('uiSchema...', uiSchema)
  console.groupEnd()

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
        fields={fields}
        widgets={widgets}
        validator={validator}
        liveValidate={false}
        showErrorList={false}
        // onChange={(props) => {
        //   const { errors, formData } = props
        //   if (errors?.length === 0) {
        //     setFormData(formData)
        //   }
        // }}
        onBlur={(...props) => {
          console.log('NodeForm.onBlur...', props)
        }}
      >
        <button ref={submitFormRefSetter} style={{ display: 'none' }} />
      </Form>
    </>
  )
}
