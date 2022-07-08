import React, { useState } from 'react'
import { GripVertical } from 'react-bootstrap-icons'
import { useDraggable } from '@dnd-kit/core'

import { nodeWidth } from './constants'
import { useWorkflow } from './store'
import { ICatalogNode } from './types'

// TODO replace inlining styles and hover using onmouseenter/leave
// with CSS module or a CSS-in-JS solution
// tried CSS module with postcss but could get postcss-modules to work
const styles = {
  node: {
    width: '12rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  grip: {
    visibility: "hidden",
    cursor: 'grab'
  },
  gripHover: {
    visibility: "visible",
    cursor: 'grab'
  }
}

export const CatalogNode = ({ id, label }: ICatalogNode): JSX.Element => {
  const [hover, setHover] = useState(false)
  const { attributes, listeners, setNodeRef, transform, setActivatorNodeRef } =
    useDraggable({ id, data: { catalog: true } })
  const style =
    transform != null
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
        }
      : undefined

  const { addNodeToWorkflow } = useWorkflow()

  return (
    <li>
      <button
        ref={setNodeRef}
        style={{ ...styles.node, ...style, width: `${nodeWidth}rem` }}
        {...attributes}
        title={label}
        className={'btn btn-light btn-sm'}
        onClick={() => addNodeToWorkflow(id)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <span>{id}</span>
        <div
          ref={setActivatorNodeRef}
          {...listeners}
          className={'btn btn-light btn-sm'}
          title='Move'
          style={hover ? styles.gripHover as any : styles.grip}
        >
          <GripVertical />
        </div>
      </button>
    </li>
  )
}
