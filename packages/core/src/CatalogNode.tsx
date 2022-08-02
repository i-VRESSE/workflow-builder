/** @jsxRuntime classic */ // storybook builder can not use default jsxRuntime so overwritting it here.
/** @jsx jsx */
import { jsx, css } from '@emotion/react'
import { useDraggable } from '@dnd-kit/core'

import { nodeWidth } from './constants'
import { useWorkflow } from './store'
import { ICatalogNode } from './types'
import { GripVertical } from './GripVertical'

const buttonStyle = css({
  width: `${nodeWidth}rem`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,

  '& .grip': {
    visibility: 'hidden',
    cursor: 'grab'
  },

  '&:hover .grip': {
    visibility: 'visible'
  }
})

export const CatalogNode = ({ id, label }: ICatalogNode): JSX.Element => {
  const { attributes, listeners, setNodeRef, transform, setActivatorNodeRef } =
    useDraggable({ id, data: { catalog: true } })
  const dragStyle =
    transform != null
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
        }
      : {}

  const { addNodeToWorkflow } = useWorkflow()

  return (
    <li>
      <button
        ref={setNodeRef}
        css={buttonStyle}
        style={dragStyle}
        {...attributes}
        title={label}
        className='btn btn-light btn-sm'
        onClick={() => addNodeToWorkflow(id)}
      >
        <span>{id}</span>
        <div
          ref={setActivatorNodeRef}
          {...listeners}
          className='btn btn-light btn-sm grip'
          title='Move'
        >
          <GripVertical />
        </div>
      </button>
    </li>
  )
}
