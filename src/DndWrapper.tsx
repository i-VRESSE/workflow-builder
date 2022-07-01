import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DndContext, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useDraggingCatalogNodeState, useSelectNodeIndex, useWorkflow, useWorkflowNodes } from "./store";

export const DnDWrapper = ({
  children,
}: React.PropsWithChildren<{}>): JSX.Element => {
  const { addNodeToWorkflow, addNodeToWorkflowAt } = useWorkflow();
  const [nodes, setNodes] = useWorkflowNodes();
  const [_activeCatalogNode, setaAtiveCatalogNode] = useDraggingCatalogNodeState()

  return (
    <DndContext onDragEnd={handleDragEnd}  onDragStart={handleDragStart} autoScroll={false}>
      <ToastContainer
        position="top-center"
        autoClose={1000}
        closeOnClick
        pauseOnFocusLoss
      />
      {children}
    </DndContext>
  );

  function handleDragStart(event: DragStartEvent) {
    if (event.active.data.current?.catalog) {
      setaAtiveCatalogNode(event.active.id)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.data.current?.catalog) {
      if (over === null) {
        addNodeToWorkflow(`${active.id}`);
      } else {
        const targetIndex = nodes.findIndex((n) => n.code === over!.id)
        addNodeToWorkflowAt(`${active.id}`, targetIndex)
      }
      setaAtiveCatalogNode(null)
    } else if (active.id !== over!.id) {
      setNodes((items) => {
        const oldIndex = items.findIndex((n) => n.code === active.id);
        const newIndex = items.findIndex((n) => n.code === over!.id);

        return arrayMove(items, oldIndex, newIndex);
      });
      // TODO setSelectedNodeIndex 
    }
  }
};
