import React from 'react'
import {
  useCatalog,
  useFiles,
  useWorkflow
} from '@i-vresse/wb-core/dist/store'
import { catalog2tomlSchemas } from '@i-vresse/wb-core/dist/toml'
import { createZip } from '@i-vresse/wb-core/dist/archive'
import { Dropdown, SplitButton } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { createHistory, uploadZip, addUpload2History, waitForJob, submitHaddock } from './galaxyclient'

const toastOptions: any = {
  autoClose: false,
  closeOnClick: false,
  draggable: false,
  closeButton: false
}

export const WorkflowSubmitButton = (): JSX.Element => {
  const { save, nodes, global } = useWorkflow()
  const files = useFiles()
  const catalog = useCatalog()

  const submitworkflow = async (): Promise<void> => {
    console.log('submitting')
    const toastId = toast('Uploading input to galaxy', {
      progress: 0.01,
      ...toastOptions
    })

    // 0. Create zip
    const tomlSchemas = catalog2tomlSchemas(catalog)
    const zip: Blob = await createZip(nodes, global, files, tomlSchemas)

    // 1. Create new history
    const historyId = await createHistory()
    // TODO when history panel is visible then switch to new history
    console.log('New history id', historyId)

    // 2. Upload zip
    const uploadSessionId = await uploadZip(zip)
    console.log('Upload session id', uploadSessionId)

    // 3. Attach uploaded zip to history
    const uploadJobId = await addUpload2History(uploadSessionId, historyId)
    console.log('Upload job id', uploadJobId)
    const uploadJob = await waitForJob(uploadJobId)
    const inputFileId = uploadJob.outputs.output0.id
    toast.update(toastId, {
      progress: 0.1,
      render: 'Input file uploaded to galaxy, running haddock3 job',
      ...toastOptions
    })

    // 3. Submit tool
    const jobId = await submitHaddock(historyId, inputFileId)
    console.log('Job id', jobId)
    const job = await waitForJob(jobId, 1000) // wait for 500s
    console.log('Completed job', job)

    // 4. results
    toast.update(toastId, {
      render: () => (
        <div>
          <p>Calculation completed successfully</p>
          <a
            target='_blank'
            href={`/datasets/${job.outputs.html_file.id}/display?previe=True`} rel='noreferrer'
          >
            Goto results
          </a>
          <p>(opens in new window)</p>
        </div>
      ),
      type: 'success',
      progress: 0.99,
      ...toastOptions
    })
  }

  return (
    <SplitButton
      id='submit'
      variant='primary'
      title='Submit'
      onClick={submitworkflow}
    >
      <Dropdown.Item onClick={save}>Download</Dropdown.Item>
    </SplitButton>
  )
}
