import React from 'react'

import { FormProps } from './FormProps'
import { GlobalForm } from './GlobalForm'
import { NodeForm } from './NodeForm'
import { useCatalog, useSelectNodeIndex } from './store'

/**
 * Panel which renders the form for the selected node or the global parameters.
 *
 */
export const NodePanel = ({ fields, widgets }: FormProps): JSX.Element => {
  const selectedNodeIndex = useSelectNodeIndex()
  const { nodeLabel } = useCatalog()

  const legend = nodeLabel ?? 'Node'

  return (
    <fieldset>
      <legend>{legend}</legend>
      {/* {form} */}
      {
        selectedNodeIndex !== -1
          ? <NodeForm
              fields={fields}
              widgets={widgets}
            />
          : <GlobalForm
              fields={fields}
              widgets={widgets}
            />
      }
    </fieldset>
  )
}
