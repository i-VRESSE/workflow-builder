import React from 'react'
import { withTheme, getDefaultRegistry, ThemeProps } from '@rjsf/core'
import { RegistryFieldsType, RegistryWidgetsType } from '@rjsf/utils';
// import utils from '@rjsf/utils'
import { Theme } from '@rjsf/bootstrap-4'
import { CollapsibleField } from './CollapsibleField'
import { TableField } from './table/TableField'
import { moleculeFormatValidators } from './molecule/formats'
import { IvresseCheckboxWidget } from './IvresseCheckboxWidget'
import { IvresseDescriptionField } from './IvresseDescriptionField'
import { ArrayFieldTemplate } from './ArrayFieldTemplate'

// TODO workaround for broken bootsrap-4 file widget, see https://github.com/rjsf-team/react-jsonschema-form/issues/2095
const registry = getDefaultRegistry()
const DefaultFileWidget = registry.widgets.FileWidget;

// New file widget seems OK?
// (Theme as any).widgets.FileWidget = (props: any) => {
//   const label = props.schema.title ?? props.label
//   return (
//     <div>
//       <label className='form-label'>{label}
//         {props.required ? '*' : null}
//       </label>
//       <DefaultFileWidget {...props} />
//     </div>
//   )
// }

(Theme as any).widgets.CheckboxWidget = IvresseCheckboxWidget

if (Theme.fields !== undefined) {
  debugger
  Theme.fields.collapsible = CollapsibleField
  Theme.fields.table = TableField
  // typescript error
  // Theme.fields.DescriptionField = IvresseDescriptionField
}

// typescript error - prop does not exist
// Theme.ArrayFieldTemplate = ArrayFieldTemplate

// if (Theme.customFormats === undefined) {
//   Theme.customFormats = {}
// }
// Theme.customFormats = { ...Theme.customFormats, ...moleculeFormatValidators }

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

// USING new templates approach?
// const theme: ThemeProps = {
//   templates: {
//     // ArrayFieldTemplate,
//     DescriptionFieldTemplate: IvresseDescriptionField,
//   },
//   widgets: {
//     CheckboxWidget: IvresseCheckboxWidget,
//   },
//   fields: {
//     CollapsibleField,
//     TableField,
//   }
// };

// export const Form = withTheme(theme)
