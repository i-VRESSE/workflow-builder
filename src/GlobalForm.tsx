import { useCatalog, useFiles, useWorkflow } from './store'
import { internalizeDataUrls } from './dataurls'
import { Form } from './Form'

export const GlobalForm = (): JSX.Element => {
  const { global: globalSchemas } = useCatalog()
  const { setParameters, global: parameters } = useWorkflow()
  const files = useFiles()
  const parametersWithDataUrls = internalizeDataUrls(parameters, files) // TODO move to hook, each time component is re-rendered this method will be called
  const uiSchema = (globalSchemas.uiSchema != null) ? globalSchemas.uiSchema : {}
  return (
    <Form schema={globalSchemas.schema} uiSchema={uiSchema} formData={parametersWithDataUrls} onSubmit={({ formData }) => setParameters(formData)} />
  )
}
