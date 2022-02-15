import { useRef, useState } from 'react'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import { useSelectNodeIndex, useWorkflow } from './store'
import { GripVertical, X } from 'react-bootstrap-icons'
import { DragItem } from './types'
import { nodeWidth } from './constants'

interface IProp {
  id: string
  index: number
}

function EmptyIcon(): JSX.Element {
  return <svg width='1em' height='1em'/>
}

export const VisualNode = ({ id, index }: IProp): JSX.Element => {
  // TODO to power hover use css :hover instead of slower JS
  const [hover, setHover] = useState(false)

  const selectedNodeIndex = useSelectNodeIndex()
  const { selectNode, moveNode, addNodeToWorkflowAt, deleteNode } = useWorkflow()

  const ref = useRef<HTMLLIElement>(null)
  const drag = useDrag(() => ({
    type: 'node',
    item: { id, index }
  }))[1]
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['catalognode', 'node'],
    drop (item: DragItem, monitor: DropTargetMonitor) {
      if (ref.current === null) {
        return
      }
      const dropIndex = index
      if (monitor.getItemType() === 'catalognode') {
        // Add catalog node at drop location
        addNodeToWorkflowAt(item.id, dropIndex)
        return
      }
      const dragIndex = item.index

      // Don't replace items with themselves
      if (dragIndex === dropIndex) {
        return
      }

      moveNode(dragIndex, dropIndex)
    },
    collect: (monitor) => {
      return {
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver()
      }
    }
  })

  const selectedStyle = selectedNodeIndex === index ? { fontWeight: 'bold' } : {}
  let style: React.CSSProperties = {}
  if (isOver) {
    style = { border: '1px solid gray' }
  } else if (canDrop) {
    style = { border: '1px dashed gray' }
  }

  // TODO after clicking node the active styling is not removed unless you activate another element
  drag(drop(ref))
  return (
    <li ref={ref} style={selectedStyle}>
      <div
        className='btn-group'
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ ...style, width: `${nodeWidth}rem`, justifyContent: 'space-between' }}
      >
        <button
          className='btn btn-light btn-sm btn-block'
          title='Click to configure or drag to reorder'
          onClick={() => {
            selectNode(index)
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={selectedStyle}>
              {id}
            </span>
            <span>
              {hover && <GripVertical />}
            </span>
          </div>
        </button>
        <button
          title='Delete'
          className='btn btn-light btn-sm'
          onClick={() => deleteNode(index)}
        >
          {hover && <X />}
        </button>
      </div>
    </li>
  )
}
