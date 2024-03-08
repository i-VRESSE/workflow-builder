import React, { PropsWithChildren, useState } from 'react'
import { TextPanel } from './TextPanel'
import { VisualPanel } from './VisualPanel'
import { useWorkflow } from './store'

type ITab = 'text' | 'visual'

/**
 * Panel which renders the workflow.
 *
 * Used selected the node of which edit its parameters.
 */
export const WorkflowPanel = ({ children }: PropsWithChildren<{}>): JSX.Element => {
  const [tab, setTab] = useState<ITab>('visual')
  const { toggleGlobalEdit } = useWorkflow()

  const selectedPanel = tab === 'visual' ? <VisualPanel /> : <TextPanel />
  const visualTabStyle = tab === 'visual' ? 'nav-link active' : 'nav-link'
  const textTabStyle = tab === 'text' ? 'nav-link active' : 'nav-link'

  return (
    <fieldset>
      <legend>Workflow</legend>
      <div style={{ display: 'flex', flexFlow: 'column', height: '100%', gap: '5px', paddingBottom: '5px' }}>
        <div className='btn-toolbar'>
          <button className='btn btn-light' onClick={toggleGlobalEdit} title='Edit global parameters'>Global parameters</button>
          {children}
        </div>
        <ul className='nav nav-tabs'>
          <li className='nav-item'>
            <button className={visualTabStyle} onClick={() => setTab('visual')}>Visual</button>
          </li>
          <li className='nav-item'>
            <button className={textTabStyle} onClick={() => setTab('text')}>Text</button>
          </li>
        </ul>
        {selectedPanel}
      </div>
    </fieldset>
  )
}
