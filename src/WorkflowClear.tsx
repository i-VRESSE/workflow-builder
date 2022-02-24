import { useWorkflowIO } from './store'

export const WorkflowClear = (): JSX.Element => {
  const { clear } = useWorkflowIO()

  return (
    <button className='btn btn-outline-danger' onClick={clear}>
      Clear
    </button>
  )
}
