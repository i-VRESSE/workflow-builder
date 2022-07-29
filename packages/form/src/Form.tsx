import { withTheme, utils, WidgetProps } from '@rjsf/core'
import { Theme } from '@rjsf/bootstrap-4'
import { CollapsibleField } from './CollapsibleField'
import { TableField } from './table/TableField'
import { moleculeFormatValidators } from './molecule/formats'
import { IvresseCheckboxWidget } from './IvresseCheckboxWidget'
import { IvresseDescriptionField } from './IvresseDescriptionField'
import { ArrayFieldTemplate } from './ArrayFieldTemplate'

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
(Theme as any).widgets.CheckboxWidget = IvresseCheckboxWidget

if (Theme.fields !== undefined) {
  Theme.fields.collapsible = CollapsibleField
  Theme.fields.table = TableField
  Theme.fields.DescriptionField = IvresseDescriptionField
}
Theme.ArrayFieldTemplate = ArrayFieldTemplate

if (Theme.customFormats === undefined) {
  Theme.customFormats = {}
}
Theme.customFormats = { ...Theme.customFormats, ...moleculeFormatValidators }

/**
 * Extended version of Form comoponent from https://github.com/rjsf-team/react-jsonschema-form
 *
 * Fixes file upload and checkobox.
 * Adds several fields and widgets.
 *
 * To hide titles and descriptions in table rows {"ui:field": "table"}) a css file must be imported.
 *
 * ```js
 * import '@i-vresse/wb-form/index.css'
 * ```
 */
export const Form = withTheme(Theme)
