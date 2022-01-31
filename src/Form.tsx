import { withTheme, utils, WidgetProps } from '@rjsf/core'
import { Theme } from '@rjsf/bootstrap-4'

// TODO workaround for broken bootsrap-4 file widget, see https://github.com/rjsf-team/react-jsonschema-form/issues/2095
const registry = utils.getDefaultRegistry()
const DefaultFileWidget = registry.widgets.FileWidget;
(Theme as any).widgets.FileWidget = (props: WidgetProps) => {
  const label = props.schema.title ?? props.label
  return (
    <div>
      <label className='form-label'>{label}
        {props.required ? '*' : null}
      </label>
      <DefaultFileWidget {...props} />
    </div>
  )
}
export const Form = withTheme(Theme)
