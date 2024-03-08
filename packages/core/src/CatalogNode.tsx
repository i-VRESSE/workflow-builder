import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import {CSS} from '@dnd-kit/utilities'

import { useWorkflow } from './store'
import { ICatalogNode } from './types'
import { GripVertical } from './GripVertical'

export const CatalogNode = ({ id, label }: ICatalogNode): JSX.Element => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform } =
    useDraggable({ id, data: { catalog: true } })
  const dragStyle =
    transform != null
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
        }
      : {}

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const { addNodeToWorkflow } = useWorkflow()

  return (
    <li>
      <button
        ref={setNodeRef}
        // style={dragStyle}
        style={style}
        {...attributes}
        title={label}
        className='btn btn-light btn-sm btn-catalog-node'
        onClick={() => addNodeToWorkflow(id)}
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
