import { useRef } from 'react'
import { useWorkflow } from './store'

export const WorkflowUpload = (): JSX.Element => {
  const uploadRef = useRef<HTMLInputElement>(null)
  const { loadWorkflowArchive } = useWorkflow()

  async function uploadWorkflow (event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    if (event.target.files == null) {
      return
    }
    const file = event.target.files[0]
    const url = URL.createObjectURL(file)
    await loadWorkflowArchive(url)
    URL.revokeObjectURL(url)
  }

  return (
    <button className='btn btn-link' onClick={() => uploadRef.current?.click()}>
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
