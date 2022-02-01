import { useSelectNodeIndex, useWorkflow } from './store'

interface IProp {
  id: string
  index: number
}

export const VisualNode = ({ id, index }: IProp): JSX.Element => {
  const selectedNodeIndex = useSelectNodeIndex()
  const { selectNode, deleteNode, moveNodeDown, moveNodeUp } = useWorkflow()
  const style = selectedNodeIndex === index ? { fontWeight: 'bold' } : {}
  return (
    <li style={style}>
      <div className='btn-group'>
        <button className='btn btn-light btn-sm' title='Configure' onClick={() => selectNode(index)}>C</button>
        <button className='btn btn-light btn-sm' title='Remove' onClick={() => deleteNode(index)}>-</button>
        <button className='btn btn-light btn-sm' title='Up' onClick={() => moveNodeUp(index)}>&#9650;</button>
        <button className='btn btn-light btn-sm' title='Down' onClick={() => moveNodeDown(index)}>&#9660;</button>
      </div>
      <span>{id}</span>
    </li>
  )
}
