import React from 'react'

import { BsX } from 'react-icons/bs'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'

import {
  useDraggingWorkflowNodeState, useSelectNodeIndex,
  useNodeHasErrorsValue, useWorkflow
} from './store'
import { GripVertical } from './GripVertical'

interface IProp {
  type: string
  index: number
  id: string
}

export const VisualNode = ({ type, index, id }: IProp): JSX.Element => {
  const nodeHasErrors = useNodeHasErrorsValue(id)
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

  // console.group('VisualNode')
  // console.log('nodeHasErrors...', nodeHasErrors)
  // console.log('selectedNodeIndex...', selectedNodeIndex)
  // console.log('draggingWorkflowNodeCode...', draggingWorkflowNodeCode)
  // console.log('index...', index)
  // console.log('type...', type)
  // console.log('id...', id)
  // console.groupEnd()

  function onNodeChange (): void {
    // console.group('VisualNode.onNodeChange()')
    // console.log('selectedNodeIndex...', selectedNodeIndex)
    // console.log('index...', index)
    // console.log('type...', type)
    // console.log('id...', id)
    // console.groupEnd()
    // change node only if different
    // (default values used on change)
    if (selectedNodeIndex !== index) {
      selectNode(index)
    }
    // selectNode(index)
  }

  // TODO after clicking node the active styling is not removed unless you activate another element
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <button
        className={`btn btn-light btn-sm btn-block btn-visual-node ${nodeHasErrors ? 'form-control is-invalid' : ''}`}
        title='Click to configure'
        style={selectedStyle}
        onClick={onNodeChange}
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
              event.stopPropagation()
              deleteNode(index)
            }}
          >
            <BsX />
          </div>
        </div>
      </button>
    </div>
  )
}
