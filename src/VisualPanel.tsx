import { useWorkflow } from './store'
import { VisualNode } from './VisualNode'

export const VisualPanel = (): JSX.Element => {
  const { nodes } = useWorkflow()
  return (
    <div>
      <ol>
        {nodes.map((node, i) => <VisualNode key={i} index={i} id={node.id} />)}
      </ol>
    </div>
  )
}
