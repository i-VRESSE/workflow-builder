import { IvresseErrorObject } from './validate'

interface Props {
  error: IvresseErrorObject
}

export const ErrorReport = ({ error }: Props): JSX.Element => {
  return (
    <div>
      In {error.workflowPath} at {error.instancePath} {error.message}, {JSON.stringify(error.params, undefined, 2)}.
    </div>
  )
}
