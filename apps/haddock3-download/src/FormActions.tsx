import { useSelectNodeIndex, useActiveSubmitButton, useWorkflow } from './store'

export const FormActions = (): JSX.Element => {
  const index = useSelectNodeIndex()
  const { deleteNode, clearNodeSelection } = useWorkflow()
  const submitFormRef = useActiveSubmitButton()
  const { editingGlobal, toggleGlobalEdit } = useWorkflow()
  if (submitFormRef === undefined || !(index > -1 || editingGlobal)) {
    return <></>
  }
  const DeleteButton = (
    <button
      className='btn btn-light'
      onClick={() => deleteNode(index)}
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
        onClick={() => submitFormRef.click()}
      >
        Submit
      </button>
      <button
        className='btn btn-light'
        onClick={() => editingGlobal ? toggleGlobalEdit() : clearNodeSelection()}
        title='Forget changes made in form'
      >
        Cancel
      </button>
      {!editingGlobal && DeleteButton}
    </div>
  )
}
