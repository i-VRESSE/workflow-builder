import { useWorkflow } from './store'
import { INode } from './types'

export const CatalogNode = ({ id, label }: INode) => {
  const { addNodeToWorkflow } = useWorkflow()
  return (
    <li>
      <button className='btn btn-light' onClick={() => addNodeToWorkflow(id)}>+</button>
      <span title={id}>{label}</span>
    </li>
  )
}
