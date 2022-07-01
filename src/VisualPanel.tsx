import { DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical, X } from "react-bootstrap-icons";
import { nodeWidth } from "./constants";
import {
  useDraggingCatalogNodeState,
  useDraggingWorkflowNodeState,
  useWorkflow,
} from "./store";
import { VisualNode } from "./VisualNode";

export const VisualPanel = (): JSX.Element => {
  const { nodes } = useWorkflow();
  const draggingCatalogNode = useDraggingCatalogNodeState()[0];
  const draggingWorkflowNodeCode = useDraggingWorkflowNodeState()[0];
  const draggingWorkflowNode = nodes.find(
    (n) => n.code === draggingWorkflowNodeCode
  );

  const nodeList = (
    <div style={{ lineHeight: "2.5em" }}>
      {nodes.map((node, i) => (
        <VisualNode key={node.code} index={i} id={node.id} code={node.code} />
      ))}
    </div>
  );
  const appendZoneStyle = {
    marginLeft: "4px",
    marginRight: "4px",
    padding: "4px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    width: `${nodeWidth}rem`,
    minHeight: "300px",
  };
  const appendZone = (
    <div style={{ ...appendZoneStyle, textAlign: "center" }}>
      Append node to workflow by clicking node in catalog or by dragging node
      from catalog to here.
    </div>
  );
  return (
    <div style={{ height: "100%" }}>
      <SortableContext
        items={nodes.map((n) => n.code)}
        strategy={verticalListSortingStrategy}
      >
        {nodeList}
      </SortableContext>
      {nodes.length === 0 ? appendZone : <></>}
      <DragOverlay dropAnimation={null}>
        {draggingCatalogNode !== null ? (
          <button
            style={{ width: `${nodeWidth}rem` }}
            title={`${draggingCatalogNode}`}
            className="btn btn-light btn-sm"
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{draggingCatalogNode}</span>
              <div
                className="btn btn-light btn-sm"
                title="Move"
                style={{ cursor: "grab" }}
              >
                <GripVertical />
              </div>
            </div>
          </button>
        ) : null}
        {draggingWorkflowNode !== undefined ? (
          <button
            style={{ width: `${nodeWidth + 2}rem` }}
            className="btn btn-light btn-sm"
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{draggingWorkflowNode.id}</span>
              <div className="btn-group">
                <div className="btn btn-light btn-sm">
                  <GripVertical />
                </div>
                <div className="btn btn-light btn-sm">
                  <X />
                </div>
              </div>
            </div>
          </button>
        ) : null}
      </DragOverlay>
    </div>
  );
};
