import { useCatalog, useFiles, useWorkflow } from './store'
import { internalizeDataUrls } from './dataurls'
import { Form } from './Form'

export const GlobalForm = () => {
  const { global: globalSchemas } = useCatalog()
  const { setParameters, global: parameters } = useWorkflow()
  const files = useFiles()
  const parametersWithDataUrls = internalizeDataUrls(parameters, files)
  const uiSchema = (globalSchemas.uiSchema != null) ? globalSchemas.uiSchema : {}
  return (
    <Form schema={globalSchemas.schema} uiSchema={uiSchema} formData={parametersWithDataUrls} onSubmit={({ formData }) => setParameters(formData)} />
  )
}
