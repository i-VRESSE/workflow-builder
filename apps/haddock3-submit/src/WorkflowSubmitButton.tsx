import React from 'react'
import { useSubmit } from './useSubmit'

export const WorkflowSubmitButton = (): JSX.Element => {
  const submitworkflow = useSubmit()

  return (
    <button className='btn btn-primary' onClick={submitworkflow}>Submit</button>
  )
}
