import React from 'react'
import { useSelectNodeIndex, useActiveSubmitButton, useWorkflow } from './store'

/**
 * Panel for actions to be performed on the currently active form.
 * A form can be for the global parameters or for the parameters of a selected node.
 *
 * The global store must be used to render a certain state.
 *
 * The submit action needs a reference to the hidden submit button in the form like so
 *
 * ```js
 * // In form component
 * import { useSetActiveSubmitButton, useWorkflow } from '@i-vresse/wb-core/dist/store'
 * ...
 * const submitFormRefSetter = useSetActiveSubmitButton()
 * return (
 *   <Form
 *        onSubmit={({ formData }) => console.log(formData)}
 *      >
 *        <button ref={submitFormRefSetter} style={{ display: 'none' }} />
 *  </Form>
 * )
 * ```
 * The FormActions component will use `submitFormRefSetter` to submit form.
 * ```
 */
export const FormActions = (): JSX.Element | null => {
  const index = useSelectNodeIndex()
  const { deleteNode, clearNodeSelection } = useWorkflow()
  const submitFormRef = useActiveSubmitButton()
  const { editingGlobal, setEditingGlobal } = useWorkflow()
  if (submitFormRef === undefined || !(index > -1 || editingGlobal)) {
    return null
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
        title={editingGlobal ? 'Save global parameters' : 'Save parameters to node'}
        onClick={() => submitFormRef.click()}
      >
        Save
      </button>
      <button
        className='btn btn-light'
        onClick={() => editingGlobal ? setEditingGlobal(false) : clearNodeSelection()}
        title='Forget changes made in form'
      >
        Cancel
      </button>
      {!editingGlobal && DeleteButton}
    </div>
  )
}
