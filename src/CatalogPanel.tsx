import { CatalogNode } from "./CatalogNode"
import { useCatalog } from "./store"


export const CatalogPanel = () => {
    const catalog = useCatalog()

    return (
        <fieldset>
        <legend>Step catalog</legend>
        <ul>
            {catalog?.nodes.map((node) => <CatalogNode key={node.id} {...node}/>)}
        </ul>
      </fieldset>
    )
}