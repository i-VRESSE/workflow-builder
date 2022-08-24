import React from 'react'
import { Form } from '@i-vresse/wb-form'

import { FormProps } from './FormProps'
import { useCatalog, useGlobalFormData, useSetActiveSubmitButton } from './store'

import '@i-vresse/wb-form/dist/index.css'

export const GlobalForm = ({ fields, widgets }: FormProps): JSX.Element => {
  const { global: globalSchemas } = useCatalog()
  const [formData, setFormData] = useGlobalFormData()
  const submitFormRefSetter = useSetActiveSubmitButton()
  const uiSchema = globalSchemas.formUiSchema
  return (
    <Form
      schema={globalSchemas.formSchema ?? {}}
      uiSchema={uiSchema}
      formData={formData}
      onSubmit={({ formData }) => setFormData(formData)}
      fields={fields}
      widgets={widgets}
    >
      <button ref={submitFormRefSetter} style={{ display: 'none' }} />
    </Form>
  )
}
