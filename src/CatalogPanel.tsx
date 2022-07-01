import { DragOverlay } from "@dnd-kit/core";
import React from "react";
import { GripVertical } from "react-bootstrap-icons";
import { CatalogCategory } from "./CatalogCategory";
import { CatalogPicker } from "./CatalogPicker";
import { nodeWidth } from "./constants";
import { Example } from "./Example";
import { useCatalog, useDraggingCatalogNodeState } from "./store";

export const CatalogPanel = (): JSX.Element => {
  const catalog = useCatalog();
  const [activeCatalogNode, _setAtiveCatalogNode] =
    useDraggingCatalogNodeState();

  return (
    <fieldset>
      <legend>Catalog</legend>
      <div>
        <CatalogPicker />
      </div>
      <React.Suspense fallback={<span>Loading catalog...</span>}>
        <h4>Nodes</h4>
        <ul style={{ lineHeight: "2.5em" }}>
          {catalog?.categories.map((category) => (
            <CatalogCategory key={category.name} {...category} />
          ))}
        </ul>
        <h4>Examples</h4>
        Workflow examples that can be loaded as a starting point.
        <ul>
          {Object.entries(catalog?.examples).map(([name, workflow]) => (
            <Example key={name} name={name} workflow={workflow} />
          ))}
        </ul>
        <DragOverlay dropAnimation={null}>
          {activeCatalogNode ? (
            <button
              style={{ width: `${nodeWidth}rem` }}
              title={`${activeCatalogNode}`}
              className="btn btn-light btn-sm"
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{activeCatalogNode}</span>
                <div className="btn btn-light btn-sm" title="Move">
                  <GripVertical />
                </div>
              </div>
            </button>
          ) : null}
        </DragOverlay>
      </React.Suspense>
    </fieldset>
  );
};
