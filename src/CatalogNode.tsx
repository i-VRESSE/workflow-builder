import { useWorkflow } from './store'
import { ICatalogNode } from './types'

export const CatalogNode = ({ id, label }: ICatalogNode): JSX.Element => {
  const { addNodeToWorkflow } = useWorkflow()
  return (
    <li>
      <button className='btn btn-light' onClick={() => addNodeToWorkflow(id)}>+</button>
      <span title={id}>{label}</span>
    </li>
  )
}
