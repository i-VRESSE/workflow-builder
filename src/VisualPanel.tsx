import { useDrop } from 'react-dnd'
import { useWorkflow } from './store'
import { DragItem } from './types'
import { VisualNode } from './VisualNode'

export const VisualPanel = (): JSX.Element => {
  const { addNodeToWorkflow } = useWorkflow()
  const [{ isCatalogNodeOver, canCatalogNodeDrop }, drop] = useDrop(
    () => ({
      accept: ['catalognode'],
      drop: (item: DragItem, monitor) => {
        // Only append node when it was not dropped already on a VisualNode
        if (!monitor.didDrop()) {
          addNodeToWorkflow(item.id)
        }
      },
      collect: (monitor) => {
        return {
          isCatalogNodeOver: monitor.isOver({ shallow: true }),
          canCatalogNodeDrop: monitor.canDrop()
        }
      }
    }),
    []
  )
  const { nodes } = useWorkflow()

  const nodeList = (
    <ol style={{ lineHeight: '2.5em' }}>
      {nodes.map((node, i) => <VisualNode key={i} index={i} id={node.id} />)}
    </ol>
  )
  const appendZoneStyle = {
    border: isCatalogNodeOver && canCatalogNodeDrop ? '1px solid gray' : '1px dashed gray',
    marginLeft: '4px',
    marginRight: '4px',
    padding: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
  const appendZone = (
    <div ref={drop} style={{ ...appendZoneStyle, textAlign: 'center' }}>
      Append node to workflow by clicking node in catalog or by dragging node from catalog to here.
    </div>
  )

  return (
    <div style={{ height: '100%' }}>
      {nodeList}
      {nodes.length === 0 || canCatalogNodeDrop ? appendZone : <></>}
    </div>
  )
}
