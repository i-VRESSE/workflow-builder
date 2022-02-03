import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import { useSelectNodeIndex, useWorkflow } from './store'
import { useRef } from 'react'
import { DragItem } from './types'

interface IProp {
  id: string
  index: number
}

export const VisualNode = ({ id, index }: IProp): JSX.Element => {
  const selectedNodeIndex = useSelectNodeIndex()
  const { selectNode, moveNode, addNodeToWorkflowAt } = useWorkflow()
  const style = selectedNodeIndex === index ? { fontWeight: 'bold' } : {}
  const ref = useRef<HTMLLIElement>(null)
  const drag = useDrag(() => ({
    type: 'node',
    item: { id, index }
  }))[1]
  const drop = useDrop({
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
    }
  })[1]
  drag(drop(ref))
  // TODO make buttons same relative size, not a absolute pixel size
  // TODO make area where node can be dropped bigger, now must be dropped on text
  return (
    <li ref={ref} style={style}>
      <button style={{ ...style, width: '200px' }} className='btn btn-light btn-sm' title='Configure' onClick={() => selectNode(index)}>{id}</button>
    </li>
  )
}
