import { useDrag } from 'react-dnd'
import { useWorkflow } from './store'
import { ICatalogNode } from './types'

export const CatalogNode = ({ id, label }: ICatalogNode): JSX.Element => {
  const drag = useDrag(() => ({
    type: 'catalognode',
    item: { id }
  }))[1]
  const { addNodeToWorkflow } = useWorkflow()
  // TODO make buttons same size
  return (
    <li ref={drag}>
      <button title={id} className='btn btn-light' onClick={() => addNodeToWorkflow(id)}>{label}</button>
    </li>
  )
}
