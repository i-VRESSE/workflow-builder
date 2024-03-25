import React, { PropsWithChildren, useState } from 'react'
import { TextPanel } from './TextPanel'
import { VisualPanel } from './VisualPanel'

type ITab = 'text' | 'visual'

/**
 * Panel which renders the workflow.
 *
 * Used selected the node of which edit its parameters.
 */
export const WorkflowPanel = ({ children }: PropsWithChildren<{}>): JSX.Element => {
  const [tab, setTab] = useState<ITab>('visual')

  const selectedPanel = tab === 'visual' ? <VisualPanel /> : <TextPanel />
  const visualTabStyle = tab === 'visual' ? 'nav-link active' : 'nav-link'
  const textTabStyle = tab === 'text' ? 'nav-link active' : 'nav-link'

  return (
    <fieldset style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }}
    >
      <legend>Workflow</legend>
      <div className='btn-toolbar'>
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
    </fieldset>
  )
}
