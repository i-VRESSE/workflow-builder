import React, { CSSProperties } from 'react'
import { DragOverlay, useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { BsX } from 'react-icons/bs'
import {
  useDraggingCatalogNodeState,
  useDraggingWorkflowNodeState,
  useNodeHasErrorsValue,
  useSelectedNode,
  useWorkflow
} from './store'
import { VisualNode } from './VisualNode'
import { GripVertical } from './GripVertical'

function GlobalListNode (): JSX.Element {
  const node = useSelectedNode()
  const globalHasErrors = useNodeHasErrorsValue('global')
  const { selectGlobalEdit } = useWorkflow()

  return (
    <button
      className={`btn btn-light btn-sm btn-block btn-visual-node ${(node != null) ? '' : 'font-bold font-weight-bold'} ${globalHasErrors ? 'form-control is-invalid' : ''} `}
      onClick={selectGlobalEdit}
      title='Edit global parameters'
    >
      0. Global parameters
    </button>
  )
}

function AppendZone (): JSX.Element {
  const appendZoneStyle: CSSProperties = {
    padding: '1rem',
    textAlign: 'center'
  }
  return (
    <div style={appendZoneStyle}>
      Append node to workflow by clicking node in catalog or by dragging node
      from catalog to here.
    </div>
  )
}

function NodeList ({ showBorder = false }: {showBorder: boolean}): JSX.Element {
  const { nodes } = useWorkflow()

  const listStyle: CSSProperties = {
    lineHeight: '2.5em',
    height: '100%'
  }
  // add dashed border
  if (showBorder) {
    listStyle.borderStyle = 'dashed'
    listStyle.borderWidth = 1
  }

  return (
    <div style={listStyle}>
      {nodes.map((node, i) => (
        <VisualNode key={node.id} index={i} type={node.type} id={node.id} />
      ))}
      {nodes.length === 0 ? <AppendZone /> : null}
    </div>
  )
}

export const VisualPanel = (): JSX.Element => {
  const { nodes } = useWorkflow()
  const draggingCatalogNode = useDraggingCatalogNodeState()[0]
  const draggingWorkflowNodeCode = useDraggingWorkflowNodeState()[0]
  const draggingWorkflowNode = nodes.find(
    (n) => n.id === draggingWorkflowNodeCode
  )
  const sortableItems = nodes.map((n) => n.id)
  if (draggingCatalogNode !== null) {
    sortableItems.push(draggingCatalogNode.toString())
  }
  const { setNodeRef } = useDroppable({ id: 'catalog-dropzone' })

  // console.group('VisualPanel')
  // console.log('nodes...', nodes)
  // console.log('sortableItems...', sortableItems)
  // console.groupEnd()

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '0.5rem 0rem'
      }}
    >
      <GlobalListNode />
      <SortableContext
        items={sortableItems}
        strategy={verticalListSortingStrategy}
      >
        {/* {nodeList} */}
        <NodeList
          showBorder={draggingWorkflowNodeCode !== null || draggingCatalogNode !== null || nodes.length === 0}
        />
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {draggingCatalogNode !== null
          ? (
            <button
              title={`${draggingCatalogNode}`}
              className='btn btn-light btn-sm btn-visual-panel'
            >
              <span>{draggingCatalogNode}</span>
              <div
                className='btn btn-light btn-sm'
                title='Move'
                style={{ cursor: 'grab' }}
              >
                <GripVertical />
              </div>
            </button>
            )
          : null}
      </DragOverlay>
      <DragOverlay modifiers={[restrictToVerticalAxis]}>
        {draggingWorkflowNode !== undefined
          ? (
            <button
              className='btn btn-light btn-sm btn-visual-panel'
            >
              <span>{draggingWorkflowNode.type}</span>
              <div className='btn-group'>
                <div className='btn btn-light btn-sm'>
                  <GripVertical />
                </div>
                <div className='btn btn-light btn-sm'>
                  <BsX />
                </div>
              </div>
            </button>
            )
          : null}
      </DragOverlay>
    </div>
  )
}
