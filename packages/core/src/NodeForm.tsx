import React from 'react'
import { EmotionJSX } from '@emotion/react/types/jsx-namespace'
import { Form } from '@i-vresse/wb-form'

import { FormProps } from './FormProps'
import { useSelectedCatalogNode, useSelectedNode, useSelectedNodeFormData, useSelectedNodeFormSchema, useSelectedNodeFormUiSchema, useSetActiveSubmitButton } from './store'

import '@i-vresse/wb-form/dist/index.css'

export const NodeForm = ({ fields, widgets }: FormProps): EmotionJSX.Element => {
  const [formData, setFormData] = useSelectedNodeFormData()
  const node = useSelectedNode()
  const catalogNode = useSelectedCatalogNode()
  const schema = useSelectedNodeFormSchema() ?? {}
  const submitFormRefSetter = useSetActiveSubmitButton()
  const uiSchema = useSelectedNodeFormUiSchema() ?? {}
  let localErrors: any[] = []
  let localData: any
  let toSave: boolean = false

  if (node === undefined) {
    return <div>No node selected</div>
  }
  if (catalogNode === undefined) {
    return <div>Unable to find schema belonging to node</div>
  }

  function onSectionBlur (e: any): void {
    console.group('NodeForm.onSectionBlur')
    console.log('formData...', localData)
    console.log('localErrors...', localErrors)
    console.log('toSave...', toSave)
    console.log('e...', e)
    console.groupEnd()
    // do not bubble events
    e.stopPropagation()
    if (localErrors?.length === 0 && toSave) {
      // debugger
      setFormData(localData)
    }
  }

  return (
    <section onBlur={onSectionBlur}>
      <h4>{catalogNode.label} ({node.type})</h4>
      <div style={{ marginBottom: '20px' }}>
        {catalogNode.description}
      </div>
      <Form
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={({ formData }) => {
          setFormData(formData)
        }}
        liveValidate
        showErrorList={false}
        onChange={(props) => {
          const { errors, formData } = props
          localErrors = errors
          localData = formData
          // set save flag if localData is not empty
          toSave = Object.keys(localData).length > 0
        }}
        fields={fields}
        widgets={widgets}
      >
        <button ref={submitFormRefSetter} style={{ display: 'none' }} />
      </Form>
    </section>
  )
}
