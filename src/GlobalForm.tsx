import { activeSubmitButtonState, useCatalog, useFiles, useWorkflow } from './store'
import { internalizeDataUrls } from './dataurls'
import { Form } from './Form'
import { useSetRecoilState } from 'recoil'

export const GlobalForm = (): JSX.Element => {
  const { global: globalSchemas } = useCatalog()
  const { setGlobalParameters, global: parameters } = useWorkflow()
  const files = useFiles()
  const submitFormRefSetter = useSetRecoilState(activeSubmitButtonState) as (instance: HTMLButtonElement | null) => void
  const parametersWithDataUrls = internalizeDataUrls(parameters, files) // TODO move to hook, each time component is re-rendered this method will be called
  const uiSchema = (globalSchemas.uiSchema != null) ? globalSchemas.uiSchema : {}
  return (
    <Form schema={globalSchemas.schema} uiSchema={uiSchema} formData={parametersWithDataUrls} onSubmit={({ formData }) => setGlobalParameters(formData)}>
      <button ref={submitFormRefSetter} style={{ display: 'none' }} />
    </Form>
  )
}
