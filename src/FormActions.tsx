import { useActiveSubmitButton, useFormSelection, useWorkflowIO } from './store'

export const FormActions = (): JSX.Element => {
  const submitFormRef = useActiveSubmitButton()
  const { clearSelection, isNodeSelected, isSelected, selectedNodeIndex } = useFormSelection()
  const { deleteNode } = useWorkflowIO()
  if (!isSelected) {
    return <></>
  }
  const DeleteButton = (
    <button
      className='btn btn-light'
      onClick={() => deleteNode(selectedNodeIndex)}
      title='Delete node from workflow'
    >
      Delete
    </button>
  )
  return (
    <div className='nav justify-content-end'>
      <button
        type='submit'
        className='btn btn-primary'
        title='Save parameters in node'
        onClick={() => submitFormRef?.click()}
      >
        Submit
      </button>
      <button
        className='btn btn-light'
        onClick={() => clearSelection()}
        title='Forget changes made in form'
      >
        Cancel
      </button>
      {isNodeSelected && DeleteButton}
    </div>
  )
}
