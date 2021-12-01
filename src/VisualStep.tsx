import { useWorkflow } from "./store"

interface IProp {
    id: string
    index: number
}

export const VisualStep = ({ id, index }: IProp) => {
    const { selectedStep, selectStep, deleteStep } = useWorkflow()
    const style = selectedStep === index ? { fontWeight: 'bold' } : {}
    return (
        <li style={style}>{id}
            <button className="btn btn-light" onClick={() => selectStep(index)}>C</button>
            <button className="btn btn-light" onClick={() => deleteStep(index)}>-</button>
        </li>
    )
}