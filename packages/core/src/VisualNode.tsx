/** @jsxImportSource @emotion/react */
/** @jsxRuntime classic */ // storybook builder can not use default jsxRuntime so overwritting it here.
/** @jsx jsx */
import { jsx, css } from '@emotion/react'
import { GripVertical, X } from 'react-bootstrap-icons'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'

import { useDraggingWorkflowNodeState, useSelectNodeIndex, useWorkflow } from './store'
import { nodeWidth } from './constants'

interface IProp {
  type: string
  index: number
  id: string
}

const buttonStyle = css({
  width: `${nodeWidth + 2}rem`,
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
  },
  '& .delete': {
    visibility: 'hidden'
  },
  '&:hover .delete': {
    visibility: 'visible'
  }
})

export const VisualNode = ({ type, index, id }: IProp): JSX.Element => {
  const selectedNodeIndex = useSelectNodeIndex()
  const { selectNode, deleteNode } = useWorkflow()
  const draggingWorkflowNodeCode = useDraggingWorkflowNodeState()[0]

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: draggingWorkflowNodeCode === id ? 0.3 : undefined
  }

  const selectedStyle =
    selectedNodeIndex === index ? { fontWeight: 'bold' } : {}

  // TODO after clicking node the active styling is not removed unless you activate another element
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <button
        className='btn btn-light btn-sm btn-block'
        title='Click to configure'
        css={buttonStyle}
        style={selectedStyle}
        onClick={() => {
          selectNode(index)
        }}
      >
        <span>
          {index + 1}. {type}
        </span>
        <div className='btn-group'>
          <div
            ref={setActivatorNodeRef}
            {...listeners}
            className='btn btn-light btn-sm grip'
            title='Move'
          >
            <GripVertical />
          </div>
          <div
            title='Delete'
            className='btn btn-light btn-sm delete'
            onClick={(event) => {
              deleteNode(index)
              event.stopPropagation()
            }}
          >
            <X />
          </div>
        </div>
      </button>
    </div>
  )
}
