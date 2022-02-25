import { useState } from 'react'
import { TextPanel } from './TextPanel'
import { VisualPanel } from './VisualPanel'
import { WorkflowUploadButton } from './WorkflowUploadButton'
import { useFormSelection } from './store'

type ITab = 'text' | 'visual'

export const WorkflowPanel = (): JSX.Element => {
  const [tab, setTab] = useState<ITab>('visual')
  const { editGlobal } = useFormSelection()

  const selectedPanel = tab === 'visual' ? <VisualPanel /> : <TextPanel />
  const visualTabStyle = tab === 'visual' ? 'nav-link active' : 'nav-link'
  const textTabStyle = tab === 'text' ? 'nav-link active' : 'nav-link'

  return (
    <fieldset style={{ height: '100%' }}>
      <legend>Workflow</legend>
      <div style={{ display: 'flex', flexFlow: 'column', height: '100%', gap: '5px', paddingBottom: '5px' }}>
        <div className='btn-toolbar'>
          <button className='btn btn-light' onClick={editGlobal}>Global parameters</button>
          <WorkflowUploadButton />
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
