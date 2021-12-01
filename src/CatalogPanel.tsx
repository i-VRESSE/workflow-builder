import { CatalogNode } from "./CatalogNode"
import { useCatalog } from "./store"
import { TemplateNode } from "./TemplateNode"


export const CatalogPanel = () => {
    const catalog = useCatalog()

    return (
        <fieldset>
        <legend>Step catalog</legend>
        <ul>
            {catalog?.nodes.map((node) => <CatalogNode key={node.id} {...node}/>)}
        </ul>
        <h3>Templates</h3>
        Workflow templates that can be loaded as a starting point.
        <ul>
            {Object.entries(catalog?.templates).map(([name, workflow]) => <TemplateNode key={name} name={name} workflow={workflow}/>)}
        </ul>
      </fieldset>
    )
}