import { useWorkflow } from "./store"
import { VisualStep } from "./VisualStep"

export const VisualPanel = () => {
    const {steps} = useWorkflow()
    return (
        <div>
            <div>Visual workflow visualization</div>
            <ol>
                {steps.map((step, i) => <VisualStep key={i} index={i} id={step.id}/>)}
            </ol>
        </div>
    )
}