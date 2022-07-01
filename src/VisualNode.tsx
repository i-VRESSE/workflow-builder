import { useSelectNodeIndex, useWorkflow } from "./store";
import { GripVertical, X } from "react-bootstrap-icons";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import classes from "./VisualNode.module.css";

interface IProp {
  id: string;
  index: number;
  code: string;
}

export const VisualNode = ({ id, index, code }: IProp): JSX.Element => {
  // TODO to power hover use css :hover instead of slower JS
  const selectedNodeIndex = useSelectNodeIndex();
  const { selectNode, deleteNode } = useWorkflow();

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: code });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const selectedStyle =
    selectedNodeIndex === index ? { fontWeight: "bold" } : {};

  // TODO after clicking node the active styling is not removed unless you activate another element
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <button
        className={"btn btn-light btn-sm btn-block " + classes.node}
        title="Click to configure"
        style={selectedStyle}
        onClick={() => {
          selectNode(index);
        }}
      >
        <span>
          {index + 1}. {id}
        </span>
        <div>
        <div
          ref={setActivatorNodeRef}
          {...listeners}
          className={"btn btn-light btn-sm " + classes.grip}
          title="Move"
        >
          <GripVertical />
        </div>
        <div
          title="Delete"
          className={"btn btn-light btn-sm " + classes.delete}
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
  );
};
