import React from 'react'
import { GlobalForm } from './GlobalForm'
import { NodeForm } from './NodeForm'
import { useSelectNodeIndex, useWorkflow } from './store'

export const NodePanel = (): JSX.Element => {
  const selectedNodeIndex = useSelectNodeIndex()
  const { editingGlobal } = useWorkflow()
  let form = <div>No node or global parameters selected for configuration.</div>
  let legend = 'Node'
  if (editingGlobal) {
    form = <GlobalForm />
    legend = 'Global parameters'
  }
  if (selectedNodeIndex !== -1) {
    form = <NodeForm />
  }
  return (
    <fieldset>
      <legend>{legend}</legend>
      {form}
    </fieldset>
  )
}
