import { useWorkflow } from "./store"

interface IProp {
    id: string
    index: number
}

export const VisualStep = ({ id, index }: IProp) => {
    const { selectedStep, selectStep, deleteStep, moveStepDown, moveStepUp } = useWorkflow()
    const style = selectedStep === index ? { fontWeight: 'bold' } : {}
    return (
        <li style={style}>
            <div className="btn-group">
                <button className="btn btn-light btn-sm" title="Configure" onClick={() => selectStep(index)}>C</button>
                <button className="btn btn-light btn-sm" title="Remove" onClick={() => deleteStep(index)}>-</button>
                <button className="btn btn-light btn-sm" title="Up" onClick={() => moveStepUp(index)}>&#9650;</button>
                <button className="btn btn-light btn-sm" title="Down" onClick={() => moveStepDown(index)}>&#9660;</button>
            </div>
            <span>{id}</span>
        </li>
    )
}