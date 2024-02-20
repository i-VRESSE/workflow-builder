import { FieldProps, WidgetProps } from '@rjsf/utils'

export interface FormProps {
  /**
   * Custom fields for React JSON schema form.
   * See https://react-jsonschema-form.readthedocs.io/en/latest/advanced-customization/custom-widgets-fields
   */
  fields?: { [name: string]: FieldProps }
  /**
   * Custom widgets for React JSON schema form.
   * See https://react-jsonschema-form.readthedocs.io/en/latest/advanced-customization/custom-widgets-fields
   */
  widgets?: { [name: string]: WidgetProps }
}
