import React from 'react'
import { useWorkflow } from '@i-vresse/wb-core/dist/store'
import { Dropdown, SplitButton } from 'react-bootstrap'
import { useSubmit } from './useSubmit'

export const WorkflowSubmitButton = (): JSX.Element => {
  const { save } = useWorkflow()
  const submitworkflow = useSubmit()

  return (
    <SplitButton
      id="submit"
      variant="primary"
      title="Submit"
      onClick={submitworkflow}
    >
      <Dropdown.Item onClick={save}>Download</Dropdown.Item>
    </SplitButton>
  )
}
