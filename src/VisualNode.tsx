import { useRef } from 'react'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import { useSelectNodeIndex, useWorkflow } from './store'
import { DragItem } from './types'
import { nodeWidth } from './constants'

interface IProp {
  id: string
  index: number
}

export const VisualNode = ({ id, index }: IProp): JSX.Element => {
  const selectedNodeIndex = useSelectNodeIndex()
  const { selectNode, moveNode, addNodeToWorkflowAt } = useWorkflow()
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
  let style: React.CSSProperties = { ...selectedStyle, width: `${nodeWidth}rem` }
  if (isOver) {
    style = { ...style, border: '1px solid gray' }
  } else if (canDrop) {
    style = { ...style, border: '1px dashed gray' }
  }

  drag(drop(ref))
  return (
    <li ref={ref} style={selectedStyle}>
      <button
        style={style}
        className='btn btn-light btn-sm'
        title='Click to configure or drag to reorder'
        onClick={() => selectNode(index)}
      >
        {id}
      </button>
    </li>
  )
}
