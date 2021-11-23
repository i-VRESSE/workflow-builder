import { INode, useWorkflow } from "./store"


export const CatalogNode = ({id, label}: INode) => {
    const {addNodeToWorkflow} = useWorkflow()
    return (
        <li>{label}<button onClick={() => addNodeToWorkflow(id)}>+</button></li>
    )
}