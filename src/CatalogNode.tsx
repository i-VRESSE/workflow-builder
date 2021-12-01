import { INode, useWorkflow } from "./store"


export const CatalogNode = ({id, label}: INode) => {
    const {addNodeToWorkflow} = useWorkflow()
    return (
        <li>
            <button className="btn btn-light" onClick={() => addNodeToWorkflow(id)}>+</button>
            <span>{label}</span>
        </li>
    )
}