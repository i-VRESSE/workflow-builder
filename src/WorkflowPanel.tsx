import { useState } from 'react'
import { TextPanel } from './TextPanel'
import { VisualPanel } from './VisualPanel'
import { WorkflowClear } from './WorkflowClear'
import { WorkflowDownload } from './WorkflowDownload'
import { WorkflowUpload } from './WorkflowUpload'

type ITab = 'text' | 'visual'

export const WorkflowPanel = (): JSX.Element => {
  const [tab, setTab] = useState<ITab>('visual')

  const selectedPanel = tab === 'visual' ? <VisualPanel /> : <TextPanel />
  const visualTabStyle = { fontWeight: tab === 'visual' ? 'bold' : 'normal' }
  const textTabStyle = { fontWeight: tab === 'text' ? 'bold' : 'normal' }

  return (
    <fieldset>
      <legend>Workflow</legend>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexFlow: 'column', height: '90vh' }}>
        <div>
          <div className='btn-group'>
            <button className='btn btn-light' style={visualTabStyle} onClick={() => setTab('visual')}>Visual</button>
            <button className='btn btn-light' style={textTabStyle} onClick={() => setTab('text')}>Text</button>
          </div>
          <WorkflowUpload />
          {selectedPanel}
        </div>
        <div className='row'>
          <WorkflowDownload />
          <WorkflowClear />
        </div>
      </div>
    </fieldset>
  )
}
