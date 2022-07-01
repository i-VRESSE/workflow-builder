import React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Active, DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useDraggingCatalogNodeState, useDraggingWorkflowNodeState, useWorkflow } from './store'

export const DnDWrapper = ({
  children
}: React.PropsWithChildren<{}>): JSX.Element => {
  const { addNodeToWorkflow, addNodeToWorkflowAt, moveNode } = useWorkflow()
  const setDraggingCatalogNode = useDraggingCatalogNodeState()[1]
  const setDraggingWorkflowNode = useDraggingWorkflowNodeState()[1]

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} autoScroll={false}>
      <ToastContainer
        position='top-center'
        autoClose={1000}
        closeOnClick
        pauseOnFocusLoss
      />
      {children}
    </DndContext>
  )

  function isCatalogNode (active: Active): boolean {
    const data = active.data.current
    return data !== undefined && 'catalog' in data && data.catalog
  }
  function handleDragStart (event: DragStartEvent): void {
    if (isCatalogNode(event.active)) {
      setDraggingCatalogNode(event.active.id)
    } else {
      setDraggingWorkflowNode(event.active.id)
    }
  }

  function handleDragEnd (event: DragEndEvent): void {
    const { active, over } = event
    const activeId = active.id.toString()
    if (isCatalogNode(active)) {
      if (over === null) {
        addNodeToWorkflow(activeId)
      } else {
        addNodeToWorkflowAt(activeId, over.id.toString())
      }
    } else if (over !== null && activeId !== over.id) {
      moveNode(activeId, over.id.toString())      
    }
    setDraggingCatalogNode(null)
    setDraggingWorkflowNode(null)
  }
}
