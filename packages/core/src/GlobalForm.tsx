import React from 'react'
import { Form } from '@i-vresse/wb-form'
import validator from '@rjsf/validator-ajv8'

// import { FormProps } from './FormProps'
import { useCatalog, useGlobalFormData, useSetActiveSubmitButton } from './store'

import '@i-vresse/wb-form/dist/index.css'

export const GlobalForm = ({ fields, widgets }: any): JSX.Element => {
  const { global: globalSchemas } = useCatalog()
  const [formData, setFormData] = useGlobalFormData()
  const submitFormRefSetter = useSetActiveSubmitButton()
  const uiSchema = globalSchemas.formUiSchema

  console.group('GlobalForm')
  console.log('fields...', fields)
  console.log('widgets...', widgets)
  console.log('globalSchemas...', globalSchemas)
  console.log('uiSchema...', uiSchema)
  console.groupEnd()

  return (
    <Form
      schema={globalSchemas.formSchema ?? {}}
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
  )
}
