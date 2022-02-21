import { useSetActiveSubmitButton, useCatalog, useFiles, useWorkflow } from './store'
import { internalizeDataUrls } from './dataurls'
import { Form } from './Form'
import { groupParameters } from './grouper'

export const GlobalForm = (): JSX.Element => {
  const { global: globalSchemas } = useCatalog()
  const { setGlobalParameters, global: parameters } = useWorkflow()
  const files = useFiles()
  const submitFormRefSetter = useSetActiveSubmitButton()
  // TODO move to hook, each time component is re-rendered this method will be called
  const formData = groupParameters(internalizeDataUrls(parameters, files), globalSchemas.uiSchema)
  const uiSchema = (globalSchemas.formUiSchema != null) ? globalSchemas.formUiSchema : {}
  return (
    <Form
      schema={globalSchemas.formSchema ?? {}}
      uiSchema={uiSchema}
      formData={formData}
      onSubmit={({ formData }) => setGlobalParameters(formData)}
    >
      <button ref={submitFormRefSetter} style={{ display: 'none' }} />
    </Form>
  )
}
