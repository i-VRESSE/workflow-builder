import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ErrorBoundary } from "./ErrorBoundary";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useWorkflow, useWorkflowNodes } from "./store";

export const DnDWrapper = ({
  children,
}: React.PropsWithChildren<{}>): JSX.Element => {
  const { addNodeToWorkflow } = useWorkflow();
  const [nodes, setNodes] = useWorkflowNodes();

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <ToastContainer
        position="top-center"
        autoClose={1000}
        closeOnClick
        pauseOnFocusLoss
      />
      {children}
    </DndContext>
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over === null) {
      addNodeToWorkflow(`${active.id}`);
    } else if (active.id !== over!.id) {
      setNodes((items) => {
        const oldIndex = items.findIndex((n) => n.code === active.id);
        const newIndex = items.findIndex((n) => n.code === over!.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
};
