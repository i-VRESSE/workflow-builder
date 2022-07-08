import React from 'react'
import { useRef } from 'react'
import { toast } from 'react-toastify'
import { useWorkflow } from './store'

export const WorkflowUploadButton = (): JSX.Element => {
  const uploadRef = useRef<HTMLInputElement>(null)
  const { loadWorkflowArchive } = useWorkflow()

  async function uploadWorkflow (event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    if (event.target.files == null) {
      return
    }
    const file = event.target.files[0]
    const url = URL.createObjectURL(file)
    await toast.promise(
      async () => {
        try {
          await loadWorkflowArchive(url)
        } finally {
          URL.revokeObjectURL(url)
        }
      },
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
    <button className='btn btn-light' onClick={() => uploadRef.current?.click()}>
      Upload
      <input
        type='file'
        accept='application/zip,.zip'
        onChange={uploadWorkflow}
        ref={uploadRef}
        style={{ opacity: 0, width: 0, height: 0 }}
      />
    </button>
  )
}
