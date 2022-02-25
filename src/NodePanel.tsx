import { GlobalForm } from './GlobalForm'
import { NodeForm } from './NodeForm'
import { useFormSelection } from './store'

export const NodePanel = (): JSX.Element => {
  const { isNodeSelected, isGlobalSelected } = useFormSelection()
  let form = <div>No node or global parameters selected for configuration.</div>
  let legend = ''
  if (isNodeSelected) {
    legend = 'Node'
    form = <NodeForm />
  } else if (isGlobalSelected) {
    legend = 'Global parameters'
    form = <GlobalForm />
  }
  return (
    <fieldset>
      <legend>{legend}</legend>
      {form}
    </fieldset>
  )
}
