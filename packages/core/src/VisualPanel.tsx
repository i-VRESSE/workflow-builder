import React, { CSSProperties } from 'react'
import { DragOverlay, useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { BsX } from 'react-icons/bs'
import { nodeWidth } from './constants'
import {
  useDraggingCatalogNodeState,
  useDraggingWorkflowNodeState,
  useWorkflow
} from './store'
import { VisualNode } from './VisualNode'
import { GripVertical } from './GripVertical'

export const VisualPanel = (): JSX.Element => {
  const { nodes } = useWorkflow()
  const draggingCatalogNode = useDraggingCatalogNodeState()[0]
  const draggingWorkflowNodeCode = useDraggingWorkflowNodeState()[0]
  const draggingWorkflowNode = nodes.find(
    (n) => n.id === draggingWorkflowNodeCode
  )

  const appendZoneStyle: CSSProperties = {
    padding: 10,
    textAlign: 'center'
  }
  const appendZone = (
    <div style={appendZoneStyle}>
      Append node to workflow by clicking node in catalog or by dragging node
      from catalog to here.
    </div>
  )

  let listStyle: CSSProperties = { lineHeight: '2.5em', height: '100%' }
  if (draggingWorkflowNodeCode !== null || draggingCatalogNode !== null || nodes.length === 0) {
    listStyle = {
      ...listStyle,
      borderStyle: 'dashed',
      borderWidth: 1
    }
  }
  const nodeList = (
    <div style={listStyle}>
      {nodes.map((node, i) => (
        <VisualNode key={node.id} index={i} type={node.type} id={node.id} />
      ))}
      {nodes.length === 0 ? appendZone : <></>}
    </div>
  )

  const sortableItems = nodes.map((n) => n.id)
  if (draggingCatalogNode !== null) {
    sortableItems.push(draggingCatalogNode.toString())
  }
  const { setNodeRef } = useDroppable({ id: 'catalog-dropzone' })
  return (
    <div ref={setNodeRef} style={{ height: '100%' }}>
      <SortableContext
        items={sortableItems}
        strategy={verticalListSortingStrategy}
      >
        {nodeList}
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {draggingCatalogNode !== null
          ? (
            <button
              style={{ width: `${nodeWidth}rem` }}
              title={`${draggingCatalogNode}`}
              className='btn btn-light btn-sm'
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{draggingCatalogNode}</span>
                <div
                  className='btn btn-light btn-sm'
                  title='Move'
                  style={{ cursor: 'grab' }}
                >
                  <GripVertical />
                </div>
              </div>
            </button>
            )
          : null}
      </DragOverlay>
      <DragOverlay modifiers={[restrictToVerticalAxis]}>
        {draggingWorkflowNode !== undefined
          ? (
            <button
              style={{ width: `${nodeWidth + 2}rem` }}
              className='btn btn-light btn-sm'
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{draggingWorkflowNode.type}</span>
                <div className='btn-group'>
                  <div className='btn btn-light btn-sm'>
                    <GripVertical />
                  </div>
                  <div className='btn btn-light btn-sm'>
                    <BsX />
                  </div>
                </div>
              </div>
            </button>
            )
          : null}
      </DragOverlay>
    </div>
  )
}
