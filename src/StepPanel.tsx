import { GlobalForm } from './GlobalForm'
import { StepForm } from './StepForm'
import { useSelectStepIndex, useWorkflow } from './store'

export const StepPanel = (): JSX.Element => {
  const selectedStepIndex = useSelectStepIndex()
  const { editingGlobal } = useWorkflow()
  let form = <div>No step or global parameters selected for configuration.</div>
  let legend = 'Step'
  if (editingGlobal) {
    form = <GlobalForm />
    legend = 'Global parameters'
  }
  if (selectedStepIndex !== -1) {
    form = <StepForm />
  }
  return (
    <fieldset>
      <legend>{legend}</legend>
      {form}
    </fieldset>
  )
}
