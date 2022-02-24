import { nodeWidth } from './constants'
import { useDrag } from 'react-dnd'

import { ICatalogNode } from './types'
import { GripVertical } from 'react-bootstrap-icons'
import { useState } from 'react'
import { useWorkflowNodes } from './store'

export const CatalogNode = ({ id, label }: ICatalogNode): JSX.Element => {
  const [hover, setHover] = useState(false)

  const drag = useDrag(() => ({
    type: 'catalognode',
    item: { id }
  }))[1]

  const { addNodeToWorkflow } = useWorkflowNodes()

  return (
    <li ref={drag}>
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
          <span>
            {hover && <GripVertical />}
          </span>
        </div>
      </button>

    </li>
  )
}
