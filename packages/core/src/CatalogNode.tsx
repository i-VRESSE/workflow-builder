import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

import { useWorkflow } from './store'
import { ICatalogNode } from './types'
import { GripVertical } from './GripVertical'

export const CatalogNode = ({ id, label }: ICatalogNode): JSX.Element => {
  const { addNodeToWorkflow } = useWorkflow()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform } = useDraggable({ id, data: { catalog: true } })

  const style = {
    transform: CSS.Translate.toString(transform)
  }

  return (
    <li>
      <button
        ref={setNodeRef}
        style={style}
        {...attributes}
        title={label}
        className='btn btn-light btn-sm btn-catalog-node'
        onClick={(e) => {
          // prevent bubbling click even to parent which toggles the group
          e.stopPropagation()
          // add node to workflow
          addNodeToWorkflow(id)
        }}
      >
        <span>{id}</span>
        <div
          ref={setActivatorNodeRef}
          {...listeners}
          className='btn btn-light btn-sm grip'
          title='Move'
        >
          <GripVertical />
        </div>
      </button>
    </li>
  )
}
