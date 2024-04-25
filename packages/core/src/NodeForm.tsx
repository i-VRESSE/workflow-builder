import React from 'react'
import { EmotionJSX } from '@emotion/react/types/jsx-namespace'
import { Form } from '@i-vresse/wb-form'

import { FormProps } from './FormProps'
import {
  useSelectedCatalogNode, useSelectedNode,
  useSelectedNodeFormData, useSelectedNodeFormSchema,
  useSelectedNodeFormUiSchema, useSetActiveSubmitButton,
  useAutosaveValue
} from './store'

import '@i-vresse/wb-form/dist/index.css'

export const NodeForm = ({ fields, widgets }: FormProps): EmotionJSX.Element => {
  const catalogNode = useSelectedCatalogNode()
  const [formData, setFormData] = useSelectedNodeFormData()
  const schema = useSelectedNodeFormSchema() ?? {}
  const submitFormRefSetter = useSetActiveSubmitButton()
  const uiSchema = useSelectedNodeFormUiSchema() ?? {}
  const autosave = useAutosaveValue()
  const node = useSelectedNode()

  // console.group('NodeForm')
  // console.log('formData...', formData)
  // console.log('autosave...', autosave)
  // console.log('node...', node)
  // console.log('catalogNode...', catalogNode)
  // console.log('schema...', schema)
  // console.log('uiSchema...', uiSchema)
  // console.groupEnd()

  if (node === undefined) {
    return <div>No node selected</div>
  }
  if (catalogNode === undefined) {
    return <div>Unable to find schema belonging to node</div>
  }

  return (
    <section>
      <h4>{catalogNode.label} ({node.type})</h4>
      <div style={{ marginBottom: '20px' }}>
        {catalogNode.description}
      </div>
      <Form
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={({ formData, errors }) => {
          // NOTE! 2024-04-10
          // update state and pass form errors for this node
          setFormData({
            ...formData,
            formErrors: errors
          })
        }}
        liveValidate={autosave ?? undefined}
        showErrorList={false}
        onChange={({ formData, errors }) => {
          // save on change if autosave ON
          if (autosave) {
            // NOTE! 2024-04-10
            // update state and pass form errors for this node
            setFormData({
              ...formData,
              formErrors: errors
            })
          }
        }}
        fields={fields}
        widgets={widgets}
      >
        <button ref={submitFormRefSetter} style={{ display: 'none' }} />
      </Form>
    </section>
  )
}
