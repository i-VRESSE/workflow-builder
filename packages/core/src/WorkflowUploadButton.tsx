import React, { useRef } from 'react'
import { UpdateOptions, toast } from 'react-toastify'
import { useClearErrors, useWorkflow } from './store'
import { ValidationError, flattenValidationErrors } from './validate'

function ErrorsList ({ error }: { error: ValidationError }): JSX.Element {
  return (
    <>
      <div>Workflow archive failed to load.</div>
      <ul style={{ maxHeight: '20rem', overflow: 'auto' }}>
        {flattenValidationErrors(error).map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </>
  )
}

export const WorkflowUploadButton = (): JSX.Element => {
  const uploadRef = useRef<HTMLInputElement>(null)
  const { loadWorkflowArchive } = useWorkflow()
  const { clearErrors } = useClearErrors()

  async function uploadWorkflow (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    if (event.target.files == null) {
      return
    }
    const file = event.target.files[0]
    const url = URL.createObjectURL(file)
    const toastId = toast.loading('Loading workfow ...')
    // clear all form errors before loading different configuration
    clearErrors()
    try {
      await loadWorkflowArchive(url)
      toast.update(toastId, {
        type: 'success',
        render: 'Workflow loaded',
        autoClose: 1000,
        isLoading: false,
        progress: 1
      })
      toast.dismiss(toastId)
    } catch (error) {
      const opts: Partial<UpdateOptions> = {
        type: 'error',
        autoClose: false,
        closeOnClick: true,
        closeButton: true,
        isLoading: false,
        progress: 1
      }
      if (error instanceof ValidationError) {
        toast.update(toastId, {
          ...opts,
          render: <ErrorsList error={error} />
        })
      } else {
        console.error(error)
        toast.update(toastId, {
          ...opts,
          render:
            'Workflow archive failed to load. See DevTools (F12) console for errors.'
        })
      }
    } finally {
      URL.revokeObjectURL(url)
      if (uploadRef.current != null) {
        // remove value in order to trigger on change event
        // when uploading same file for the second time
        uploadRef.current.value = ''
      }
    }
  }

  return (
    <button
      className='btn btn-outline-secondary'
      onClick={() => {
        uploadRef.current?.click()
      }}
      title='Upload an archive'
    >
      Upload
      <input
        ref={uploadRef}
        type='file'
        tabIndex={-1}
        accept='application/zip,.zip'
        onChange={uploadWorkflow as any}
        style={{
          display: 'none'
        }}
      />
    </button>
  )
}
