import { nodeWidth } from './constants'
import { useWorkflow } from './store'
import { ICatalogNode } from './types'
import { GripVertical } from 'react-bootstrap-icons'
import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'

export const CatalogNode = ({ id, label }: ICatalogNode): JSX.Element => {
  const [hover, setHover] = useState(false)

  const {attributes, listeners, setNodeRef, transform, setActivatorNodeRef} = useDraggable({id});
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const { addNodeToWorkflow } = useWorkflow()

  return (
    <li ref={setNodeRef} style={style} {...attributes}>
      <button
        style={{ width: `${nodeWidth}rem` }}
        title={label}
        className='btn btn-light btn-sm'
        onClick={() => addNodeToWorkflow(id)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>
            {id}
          </span>
          <div ref={setActivatorNodeRef} {...listeners} className='btn btn-light btn-sm' title="Move">
            <GripVertical />
          </div>
        </div>
      </button>

    </li>
  )
}
