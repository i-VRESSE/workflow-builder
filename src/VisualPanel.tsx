import { useDrop } from 'react-dnd'
import { useWorkflow } from './store'
import { DragItem } from './types'
import { VisualNode } from './VisualNode'

export const VisualPanel = (): JSX.Element => {
  const { addNodeToWorkflow } = useWorkflow()
  const drop = useDrop(
    () => ({
      accept: ['catalognode'],
      drop: (item: DragItem, monitor) => {
        // Only append node when it was not dropped already on a VisualNode
        if (!monitor.didDrop()) {
          addNodeToWorkflow(item.id)
        }
      }
    }),
    []
  )[1]
  const { nodes } = useWorkflow()

  return (
    <div ref={drop} style={{ height: '100%' }}>
      <ol style={{ lineHeight: '2.5em' }}>
        {nodes.map((node, i) => <VisualNode key={i} index={i} id={node.id} />)}
      </ol>
      <div style={{ border: '1px dashed gray', padding: '4px' }}>
        <p>Add node by clicking node in catalog or by dragging node from catalog to here.</p>
        <p>Reorder nodes by dragging them to the desired place. Click node to configure it.</p>
      </div>
    </div>
  )
}
