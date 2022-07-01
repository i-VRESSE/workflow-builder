import React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Active, DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useDraggingCatalogNodeState, useWorkflow, useWorkflowNodes } from './store'

export const DnDWrapper = ({
  children
}: React.PropsWithChildren<{}>): JSX.Element => {
  const { addNodeToWorkflow, addNodeToWorkflowAt } = useWorkflow()
  const [nodes, setNodes] = useWorkflowNodes()
  const setaAtiveCatalogNode = useDraggingCatalogNodeState()[1]

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
      setaAtiveCatalogNode(event.active.id)
    }
  }

  function handleDragEnd (event: DragEndEvent): void {
    const { active, over } = event
    if (isCatalogNode(active)) {
      if (over === null) {
        addNodeToWorkflow(`${active.id}`)
      } else {
        const targetIndex = nodes.findIndex((n) => n.code === over.id)
        addNodeToWorkflowAt(`${active.id}`, targetIndex)
      }
      setaAtiveCatalogNode(null)
    } else if (over !== null && active.id !== over.id) {
      setNodes((items) => {
        const oldIndex = items.findIndex((n) => n.code === active.id)
        const newIndex = items.findIndex((n) => n.code === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
      // TODO setSelectedNodeIndex
    }
  }
}
