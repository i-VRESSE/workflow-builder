import { useWorkflow } from './store'

export const WorkflowClear = (): JSX.Element => {
  const { clearNodes } = useWorkflow()

  function clearWorkflow (): void {
    clearNodes()
  }

  return (
    <button className='btn btn-outline-danger' onClick={clearWorkflow}>
      Clear
    </button>
  )
}
