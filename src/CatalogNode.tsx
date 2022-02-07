import { nodeWidth } from './constants'
import { useDrag } from 'react-dnd'
import { useWorkflow } from './store'
import { ICatalogNode } from './types'

export const CatalogNode = ({ id, label }: ICatalogNode): JSX.Element => {
  const drag = useDrag(() => ({
    type: 'catalognode',
    item: { id }
  }))[1]
  const { addNodeToWorkflow } = useWorkflow()
  return (
    <li ref={drag}>
      <button style={{ width: `${nodeWidth}rem` }} title={label} className='btn btn-light btn-sm' onClick={() => addNodeToWorkflow(id)}>{id}</button>
    </li>
  )
}
