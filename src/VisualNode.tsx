import { useSelectNodeIndex, useWorkflow } from './store'
import { GripVertical, X } from 'react-bootstrap-icons'
import { CSS } from '@dnd-kit/utilities'
import { nodeWidth } from './constants'
import { useSortable } from '@dnd-kit/sortable'

interface IProp {
  id: string
  index: number
  code: string
}

export const VisualNode = ({ id, index, code }: IProp): JSX.Element => {
  // TODO to power hover use css :hover instead of slower JS
  const selectedNodeIndex = useSelectNodeIndex()
  const { selectNode, deleteNode } = useWorkflow()

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition
  } = useSortable({ id: code })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }
  const selectedStyle = selectedNodeIndex === index ? { fontWeight: 'bold' } : {}

  // TODO after clicking node the active styling is not removed unless you activate another element
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        className='btn-group'
      >
        <button
          className='btn btn-light btn-sm btn-block'
          title='Click to configure'
          style={{ width: `${nodeWidth}rem`, display: 'flex', justifyContent: 'space-between', ...selectedStyle }}
          onClick={() => {
            selectNode(index)
          }}
        >
          {index + 1}. {id}
        </button>
        <button ref={setActivatorNodeRef} {...listeners} className='btn btn-light btn-sm' title='Move'>
          <GripVertical />
        </button>
        <button
          title='Delete'
          className='btn btn-light btn-sm'
          onClick={() => deleteNode(index)}
        >
          <X />
        </button>
      </div>
    </div>
  )
}
