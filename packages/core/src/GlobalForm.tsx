import React from 'react'
import { Form } from '@i-vresse/wb-form'

import { FormProps } from './FormProps'
import { useCatalog, useGlobalFormData, useSetActiveSubmitButton, useAutosaveValue, useSetNodeErrors } from './store'

import '@i-vresse/wb-form/dist/index.css'

export const GlobalForm = ({ fields, widgets }: FormProps): JSX.Element => {
  const { global: globalSchemas } = useCatalog()
  const [formData, setFormData] = useGlobalFormData()
  const submitFormRefSetter = useSetActiveSubmitButton()
  const autosave = useAutosaveValue()
  const setNodeHasErrors = useSetNodeErrors()
  const uiSchema = globalSchemas.formUiSchema

  return (
    <section>
      <h4>Global parameters</h4>
      <Form
        schema={globalSchemas.formSchema ?? {}}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={({ formData, errors }) => {
          setFormData(formData)
          // update state and pass form errors for this node
          setNodeHasErrors('global', {
            hasErrors: errors?.length > 0,
            errors
          })
        }}
        liveValidate
        showErrorList={false}
        onChange={({ formData, errors }) => {
          // save on change if autosave ON
          if (autosave) {
            // update form
            setFormData(formData)
            // update state and pass form errors for this node
            setNodeHasErrors('global', {
              hasErrors: errors?.length > 0,
              errors
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
