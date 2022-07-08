import React, { useState } from 'react'
import { GripVertical, X } from 'react-bootstrap-icons'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { useDraggingWorkflowNodeState, useSelectNodeIndex, useWorkflow } from './store'

interface IProp {
  type: string
  index: number
  id: string
}

const styles = {
  node: {
    width: '12rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  grip: {
    visibility: "hidden",
    cursor: 'grab'
  },
  gripHover: {
    visibility: "visible",
    cursor: 'grab'
  },
  delete: {
    visibility: "hidden"
  },
  deleteHover: {
    visibility: "visible",
  }
}


export const VisualNode = ({ type, index, id }: IProp): JSX.Element => {
  const [hover, setHover] = useState(false)
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
        className={'btn btn-light btn-sm btn-block ivresses-wb-workflow-node'}
        title='Click to configure'
        style={{...styles.node, ...selectedStyle}}
        onClick={() => {
          selectNode(index)
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <span>
          {index + 1}. {type}
        </span>
        <div className='btn-group'>
          <div
            ref={setActivatorNodeRef}
            {...listeners}
            className={'btn btn-light btn-sm ivresses-wb-workflow-grip'}
            title='Move'
            style={hover ? styles.gripHover as any : styles.grip}
          >
            <GripVertical />
          </div>
          <div
            title='Delete'
            className={'btn btn-light btn-sm ivresses-wb-workflow-delete'}
            onClick={(event) => {
              deleteNode(index)
              event.stopPropagation()
            }}
            style={hover ? styles.gripHover as any : styles.grip}
          >
            <X />
          </div>
        </div>
      </button>
    </div>
  )
}
