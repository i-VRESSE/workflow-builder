import React from 'react'

import { FormProps } from './FormProps'
import { GlobalForm } from './GlobalForm'
import { NodeForm } from './NodeForm'
import { useSelectNodeIndex, useWorkflow } from './store'

/**
 * Panel which renders the form for the selected node or the global parameters.
 *
 */
export const NodePanel = ({ fields, widgets }: FormProps): JSX.Element => {
  const selectedNodeIndex = useSelectNodeIndex()
  const { editingGlobal } = useWorkflow()
  let form = <div>No node or global parameters selected for configuration.</div>
  let legend = 'Node'

  function onSectionBlur (): void {
    console.group('NodePanel.onSectionBlur')
    console.log('form...', form)
    console.groupEnd()
    // if (localErrors?.length === 0 && toSave) {
    //   setFormData(localData)
    // }
  }

  if (editingGlobal) {
    form = (
      <GlobalForm
        fields={fields}
        widgets={widgets}
      />
    )
    legend = 'Global parameters'
  }
  if (selectedNodeIndex !== -1) {
    form = (
      <NodeForm
        fields={fields}
        widgets={widgets}
      />
    )
  }
  return (
    <fieldset onBlur={onSectionBlur}>
      <legend>{legend}</legend>
      {form}
    </fieldset>
  )
}
