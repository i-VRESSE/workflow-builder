import React, { useState } from 'react'
import { useCatalog } from './store'
import { ICategory } from './types'
import { CatalogNode } from './CatalogNode'

export const CatalogCategory = ({ name, description, collapsed: initiallyCollapsed }: ICategory): JSX.Element => {
  const [collapsed, setCollapsed] = useState(initiallyCollapsed ?? false)
  const catalog = useCatalog()
  const style = {
    // TODO On https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-type
    // disclosure-open/closed are said to be experimental, find how much compatibility there is.
    listStyleType: collapsed ? 'disclosure-closed' : 'disclosure-open'
    // utf failed in chrome
    // listStyleType: collapsed ? '⏷' : '⏵'
  }
  return (
    <li
      style={style} onClick={(e) => {
        if (e.target === e.currentTarget) {
          // only toggle when list marker is clicked
          return setCollapsed((c) => !c)
        }
      }}
    >
      <span title={description}>{name}</span>
      {
      !collapsed &&
        <ul>
          {catalog?.nodes.filter((node) => node.category === name).map((node) => <CatalogNode key={node.id} {...node} />)}
        </ul>
      }
    </li>
  )
}
