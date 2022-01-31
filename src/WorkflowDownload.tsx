import { useWorkflow } from './store'

export const WorkflowDownload = (): JSX.Element => {
  const { save } = useWorkflow()
  return (
    <button className='btn btn-primary' onClick={save}>Download archive</button>
  )
}
