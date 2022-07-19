import React from 'react'
import { useWorkflow } from './store'

export const WorkflowClear = (): JSX.Element => {
  const { clear } = useWorkflow()

  return (
    <button className='btn btn-outline-danger' onClick={clear}>
      Clear
    </button>
  )
}
