import { useWorkflow } from "./store"

interface IProp {
    id: string
    index: number
}

export const VisualStep = ({ id, index}: IProp) => {
    const { selectedStep, selectStep, deleteStep } = useWorkflow()
    const style = selectedStep === index ? {border: '1px solid gray'} : {}
    return (
        <li style={style}>{id} <button onClick={() => selectStep(index)}>C</button><button onClick={() => deleteStep(index)}>-</button></li>
    )
}