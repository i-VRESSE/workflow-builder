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
      <button style={{ width: '200px' }} title={label} className='btn btn-light btn-sm' onClick={() => addNodeToWorkflow(id)}>{id}</button>
    </li>
  )
}
