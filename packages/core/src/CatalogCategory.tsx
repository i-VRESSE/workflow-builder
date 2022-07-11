import React from 'react'
import { useCatalog } from './store'
import { ICategory } from './types'
import { CatalogNode } from './CatalogNode'

export const CatalogCategory = ({ name, description }: ICategory): JSX.Element => {
  const catalog = useCatalog()
  return (
    <li>
      <span title={description}>{name}</span>
      <ul>
        {catalog?.nodes.filter((node) => node.category === name).map((node) => <CatalogNode key={node.id} {...node} />)}
      </ul>
    </li>
  )
}
