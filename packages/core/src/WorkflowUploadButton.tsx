import React, { useRef } from 'react'
import { toast } from 'react-toastify'
import { useWorkflow } from './store'
import { ValidationError } from './validate'

function flattenValidationErrors (error: ValidationError): Array<string> {
  return error.errors.filter(e => e.workflowPath !== undefined && e.message !=== undefined).map((e) => {
    let message = e.message
    message = `Error in ${e.workflowPath}${e.instancePath}: ${message}`
    if (e.params.additionalProperty) {
      message += `: ${e.params.additionalProperty}`
    }
    if (e.params.allowedValues) {
      message += `: ${e.params.allowedValues.join(', ')}`
    }
    return message
  })
}

function ErrorsList ({ error }: { error: ValidationError }): JSX.Element {
  return (
    <>
      <div>Workflow archive failed to load.</div>
      <ul>
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

  async function uploadWorkflow (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    if (event.target.files == null) {
      return
    }
    const file = event.target.files[0]
    const url = URL.createObjectURL(file)
    const toastId = toast.loading('Loading workfow ...')
    try {
      await loadWorkflowArchive(url)
      toast.update(toastId, { type: 'success', render: 'Workflow loaded' })
    } catch (error) {
      if (error instanceof ValidationError) {
        toast.update(toastId, {
          type: 'error',
          render: <ErrorsList error={error} />,
          autoClose: false
        })
      } else {
        console.error(error)
        toast.update(toastId, {
          type: 'error',
          render:
            'Workflow archive failed to load. See DevTools (F12) console for errors.'
        })
      }
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  return (
    <button
      className='btn btn-light'
      onClick={() => uploadRef.current?.click()}
      title='Upload an archive'
    >
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
