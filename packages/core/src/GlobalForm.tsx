import React from 'react'
import { EmotionJSX } from '@emotion/react/types/jsx-namespace'
import { Form } from '@i-vresse/wb-form'

import { FormProps } from './FormProps'
import { useCatalog, useGlobalFormData, useSetActiveSubmitButton } from './store'

import '@i-vresse/wb-form/dist/index.css'

export const GlobalForm = ({ fields, widgets }: FormProps): EmotionJSX.Element => {
  const { global: globalSchemas } = useCatalog()
  const [formData, setFormData] = useGlobalFormData()
  const submitFormRefSetter = useSetActiveSubmitButton()
  const uiSchema = globalSchemas.formUiSchema
  let localErrors: any[] = []; let localData: any; let toSave: boolean = false

  function onSectionBlur (e: any): void {
    console.group('GlobalForm.onSectionBlur')
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
      <Form
        schema={globalSchemas.formSchema ?? {}}
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
