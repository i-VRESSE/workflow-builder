import React from 'react'
import { useWorkflowHasErrors } from '@i-vresse/wb-core'
import { useSaveWithGlobalRewrite } from '@i-vresse/wb-core/dist/store'
import { toast } from 'react-toastify'

export const DownloadButton = (): JSX.Element => {
  const save = useSaveWithGlobalRewrite((current) => {
    return {
      ...current,
      run_dir: 'output'
    }
  })
  const hasErrors = useWorkflowHasErrors()

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
    <button className='btn btn-outline-primary' onClick={downloadWorkflow as any} disabled={hasErrors}>Download</button>
  )
}
