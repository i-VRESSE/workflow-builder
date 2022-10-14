import React from 'react'
import { useWorkflow } from '@i-vresse/wb-core/dist/store'
import { Dropdown, SplitButton } from 'react-bootstrap'

export const WorkflowSubmitButton = (): JSX.Element => {
  const { save } = useWorkflow()
  const submitworkflow = (): void => {
    // TODO
    // 1. Create zip using
    //    * import { useFiles, useWorkflow } from '@i-vresse/wb-core/dist/store'
    //    * createZip() from @ivresse/core/dist/archive
    // TODO talk to galaxy
    // 1. Create new history
    // 2. Upload zip + wait for zip job to complete
    // 3. Submit tool
    // 4. show progress or results ?
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
