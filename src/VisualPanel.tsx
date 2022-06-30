import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useWorkflow } from './store'
import { VisualNode } from './VisualNode'

export const VisualPanel = (): JSX.Element => {
  const { addNodeToWorkflow } = useWorkflow()
  const { nodes } = useWorkflow()

  const nodeList = (
    <div style={{ lineHeight: '2.5em' }}>
      {nodes.map((node, i) => <VisualNode key={node.code} index={i} id={node.id} code={node.code}/>)}
    </div>
  )
  const appendZoneStyle = {
    marginLeft: '4px',
    marginRight: '4px',
    padding: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
  const appendZone = (
    <div style={{ ...appendZoneStyle, textAlign: 'center' }}>
      Append node to workflow by clicking node in catalog or by dragging node from catalog to here.
    </div>
  )

  return (
    <div style={{ height: '100%' }}>
      <SortableContext items={nodes.map(n => n.code)} strategy={verticalListSortingStrategy}>
      {nodeList}
      </SortableContext>
      {nodes.length === 0 ? appendZone : <></>}
    </div>
  )
}
