import React from 'react'
import { GripVertical, X } from 'react-bootstrap-icons'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { useDraggingWorkflowNodeState, useSelectNodeIndex, useWorkflow } from './store'
import classes from './VisualNode.module.css'

interface IProp {
  type: string
  index: number
  id: string
}

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
        className={'btn btn-light btn-sm btn-block ' + classes.node}
        title='Click to configure'
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
            className={'btn btn-light btn-sm ' + classes.grip}
            title='Move'
          >
            <GripVertical />
          </div>
          <div
            title='Delete'
            className={'btn btn-light btn-sm ' + classes.delete}
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
