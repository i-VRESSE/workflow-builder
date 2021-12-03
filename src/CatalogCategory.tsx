import { ICategory, useCatalog } from "./store"
import { CatalogNode } from "./CatalogNode"


export const CatalogCategory = ({name}: ICategory) => {
    const catalog = useCatalog()
    return (
        <li>
            <span>{name}</span>
            <ul>
                {catalog?.nodes.filter((node)=> node.category === name).map((node) => <CatalogNode key={node.id} {...node}/>)}
            </ul>
        </li>
    )
}