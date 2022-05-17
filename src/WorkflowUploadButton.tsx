import { useRef } from 'react'
import { toast } from 'react-toastify'
import { ErrorReport } from './ErrorReport'
import { useWorkflow } from './store'
import { ValidationError } from './validate'

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
            if (data instanceof ValidationError) {
              return (
                <div className='text-danger'>
                  Workflow archive failed to load due to workflow validation errors:
                  <ul>
                    {data.errors.map((e, i) => <li key={i}><ErrorReport error={e} /></li>)}
                  </ul>
                  Check that selected catalog is the same as the catalog used to make the uploaded file.
                </div>
              )
            }
            if (data instanceof Error) {
              return `Workflow archive failed to load. ${data as any as string}`
            }
            console.log(data)
            return 'Workflow archive failed to load. ee DevTools (F12) console for errors.'
          },
          autoClose: false,
          closeOnClick: false,
          draggable: false
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
