import { useFiles, useSelectedNodeCatalog, useSelectedStep, useWorkflow } from './store'
import { internalizeDataUrls } from './dataurls'
import { Form } from './Form'

export const StepForm = (): JSX.Element => {
  // TODO move setPararmeters to useSelectedStep
  const { setParameters } = useWorkflow()
  const { files } = useFiles()
  const step = useSelectedStep()
  const node = useSelectedNodeCatalog()

  if (step === undefined) {
    return <div>No step selected</div>
  }
  if (node === undefined) {
    return <div>Unable to find schema belonging to node</div>
  }
  const parametersWithDataUrls = internalizeDataUrls(step.parameters, files)

  const uiSchema = (node?.uiSchema != null) ? node.uiSchema : {}
  return (
    <>
      <h4>{node.label} ({node.id})</h4>
      <div>
        {node.description}
      </div>
      <Form schema={node.schema} uiSchema={uiSchema} formData={parametersWithDataUrls} onSubmit={({ formData }) => setParameters(formData)} />
    </>
  )
}
