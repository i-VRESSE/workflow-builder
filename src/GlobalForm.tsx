import { useSetActiveSubmitButton, useCatalog, useGlobalFormData } from './store'
import { Form } from './Form'

export const GlobalForm = (): JSX.Element => {
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
    >
      <button ref={submitFormRefSetter} style={{ display: 'none' }} />
    </Form>
  )
}
