import { toast } from 'react-toastify'
import { useLoadWorkflowArchive } from './store'

interface IProps {
  name: string
  workflow: string
}

export const Example = ({ name, workflow }: IProps): JSX.Element => {
  const loadWorkflowArchive = useLoadWorkflowArchive()

  async function onClick (): Promise<void> {
    await toast.promise(
      loadWorkflowArchive(workflow),
      {
        pending: 'Loading workfow ...',
        success: 'Workflow loaded',
        error: {
          render ({ data }) {
            console.error(data)
            return 'Workflow archive failed to load. See DevTools (F12) console for errors.'
          }
        }
      }
    )
  }

  return (
    <li>
      <button
        className='btn btn-light'
        onClick={onClick}
        title={workflow}
      >
        {name}
      </button>
    </li>
  )
}
