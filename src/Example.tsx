import { useWorkflow } from './store'

interface IProps {
  name: string
  workflow: string
}

export const Example = ({ name, workflow }: IProps) => {
  const { loadWorkflowArchive } = useWorkflow()
  return <li><button className='btn btn-light' onClick={async () => await loadWorkflowArchive(workflow)} title={workflow}>{name}</button></li>
}
