import { useWorkflow } from './store'

export const WorkflowClear = (): JSX.Element => {
  const { clearNodes } = useWorkflow()

  return (
    <button className='btn btn-outline-danger' onClick={clearNodes}>
      Clear
    </button>
  )
}
