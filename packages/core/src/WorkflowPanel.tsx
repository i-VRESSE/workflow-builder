import React, { PropsWithChildren, useState } from 'react'
import { TextPanel } from './TextPanel'
import { VisualPanel } from './VisualPanel'
import { FilesList } from './FilesList'

type ITab = 'text' | 'visual' | 'files'

/**
 * Return selected tab content
 * @param tab ITab
 * @returns JSX.Element
 */
function SelectedTab ({ tab }: {tab: ITab}): JSX.Element {
  switch (tab) {
    case 'text':
      return <TextPanel />
    case 'files':
      return <FilesList />
    // visual panel is default
    default:
      return <VisualPanel />
  }
}

/**
 * Panel which renders the workflow.
 */
export const WorkflowPanel = ({ children }: PropsWithChildren<{}>): JSX.Element => {
  const [tab, setTab] = useState<ITab>('visual')

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
      <ul
        className='nav nav-tabs'
        style={{
          padding: 0,
          gap: '0.125rem'
        }}
      >
        <li className='nav-item'>
          <button className={`nav-link ${tab === 'visual' ? 'active' : ''}`} onClick={() => setTab('visual')}>Visual</button>
        </li>
        <li className='nav-item'>
          <button className={`nav-link ${tab === 'text' ? 'active' : ''}`} onClick={() => setTab('text')}>Text</button>
        </li>
        <li className='nav-item'>
          <button className={`nav-link ${tab === 'files' ? 'active' : ''}`} onClick={() => setTab('files')}>Files</button>
        </li>
      </ul>
      <SelectedTab tab={tab} />
    </fieldset>
  )
}
