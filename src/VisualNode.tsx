import { DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { XYCoord } from 'dnd-core'
import { useSelectNodeIndex, useWorkflow } from './store'
import { useRef } from 'react'
import { DragItem } from './types'

interface IProp {
  id: string
  index: number
}

export const VisualNode = ({ id, index }: IProp): JSX.Element => {
  const selectedNodeIndex = useSelectNodeIndex()
  const { selectNode, moveNode, addNodeToWorkflow } = useWorkflow()
  const style = selectedNodeIndex === index ? { fontWeight: 'bold' } : {}
  const ref = useRef<HTMLLIElement>(null)
  const [_, drag] = useDrag(() => ({
    type: 'node',
    item: { id, index }
  }))
  // Copied from https://github.com/react-dnd/react-dnd/blob/main/packages/examples-hooks/src/04-sortable/simple/Card.tsx
  const [_2, drop] = useDrop({
    accept: ['catalognode', 'node'],
    // TODO give user feedback where hovering node will end up
    drop (item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return
      }
      const dropIndex = index
      if (!('index' in item)) {
        console.log(`Inserting catalog node ${item.id}`)
        addNodeToWorkflow(item.id)
        return
      }
      const dragIndex = item.index

      // Don't replace items with themselves
      if (dragIndex === dropIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < dropIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > dropIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      console.log(`Move node from ${dragIndex} to ${dropIndex}`)
      moveNode(dragIndex, dropIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      // item.index = hoverIndex
    }
  })
  drag(drop(ref))
  // TODO make buttons same size
  // TODO make area where node can be dropped bigger, now must be dropped on text
  return (
    <li ref={ref} style={style}>
      <button style={style} className='btn btn-light btn-sm' title='Configure' onClick={() => selectNode(index)}>{id}</button>
    </li>
  )
}
