import React from 'react'
import { toast } from 'react-toastify'
import { useWorkflow } from './store'

export const WorkflowDownloadButton = (): JSX.Element => {
  const { save } = useWorkflow()

  async function downloadWorkflow (): Promise<void> {
    await toast.promise(
      save(),
      {
        pending: 'Archiving workfow ...',
        success: 'Workflow archived',
        error: {
          render ({ data }) {
            console.error(data)
            return 'Construction of workflow archive failed. See DevTools (F12) console for errors.'
          }
        }
      }
    )
  }

  return (
    <button className='btn btn-primary' onClick={downloadWorkflow}>Download</button>
  )
}
