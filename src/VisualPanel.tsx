import { useDrop } from 'react-dnd'
import { useWorkflow } from './store'
import { DragItem } from './types'
import { VisualNode } from './VisualNode'

export const VisualPanel = (): JSX.Element => {
  const { addNodeToWorkflow } = useWorkflow()
  const [_, drop] = useDrop(
    () => ({
      accept: ['catalognode'],
      drop: (item: DragItem) => {
        if ('index' in item) {
          console.log(`Move node ${item.index}`)
        } else {
          addNodeToWorkflow(item.id)
        }
      }
    }),
    []
  )
  const { nodes } = useWorkflow()

  return (
    <div ref={drop} style={{ height: '100%' }}>
      <ol>
        {nodes.map((node, i) => <VisualNode key={i} index={i} id={node.id} />)}
      </ol>
      <div style={{ border: '1px dashed gray' }}>Add node by dragging node from catalog to here. Reorder nodes by dragging them to the desired place.</div>
    </div>
  )
}
