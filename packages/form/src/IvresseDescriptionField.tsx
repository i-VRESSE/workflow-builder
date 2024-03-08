// Customized from: https://github.com/rjsf-team/react-jsonschema-form/blob/724fb0bc3f1ae5d1d9b761b2bff7cf5c64fd7459/packages/bootstrap-4/src/DescriptionField/DescriptionField.tsx#L2-L14
import React from 'react'
// import { FieldProps } from '@rjsf/core'
import {DescriptionFieldProps} from '@rjsf/utils'

// export interface DescriptionFieldProps extends Partial<FieldProps> {
//   description?: string
// }

export const IvresseDescriptionField = ({ id, description }: DescriptionFieldProps): JSX.Element => {
  if (description !== undefined || description !== '') {
    return <small><div id={id} className='mb-3 text-muted'>{description}</div></small>
  }

  return <></>
}
