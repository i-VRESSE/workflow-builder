import Form from "@rjsf/core"
import { StepForm } from "./StepForm"
import { useCatalog, useWorkflow } from "./store"

export const StepPanel = () => {
    const {selectedStep, steps} = useWorkflow()
    const catalog = useCatalog()
    let form = <div>No step selected</div>
    const step = steps[selectedStep]
    const node = catalog?.nodes.find((n) => n.id === step?.id)
    if (node) {
        form = <StepForm node={node} step={step}/>
    }
    return (
        <fieldset>
            <legend>Step</legend>
            {form}
        </fieldset>
    )
}