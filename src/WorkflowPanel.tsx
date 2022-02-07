import { useState } from 'react'
import { TextPanel } from './TextPanel'
import { VisualPanel } from './VisualPanel'
import { WorkflowDownloadButton } from './WorkflowDownloadButton'
import { WorkflowUploadButton } from './WorkflowUploadButton'

type ITab = 'text' | 'visual'

export const WorkflowPanel = (): JSX.Element => {
  const [tab, setTab] = useState<ITab>('visual')

  const selectedPanel = tab === 'visual' ? <VisualPanel /> : <TextPanel />
  const visualTabStyle = { fontWeight: tab === 'visual' ? 'bold' : 'normal' }
  const textTabStyle = { fontWeight: tab === 'text' ? 'bold' : 'normal' }

  return (
    <fieldset style={{ height: '100%' }}>
      <legend>Workflow</legend>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexFlow: 'column', height: '100%', gap: '5px', paddingBottom: '5px' }}>
        <div>
          <div className='btn-group'>
            <button className='btn btn-light' style={visualTabStyle} onClick={() => setTab('visual')}>Visual</button>
            <button className='btn btn-light' style={textTabStyle} onClick={() => setTab('text')}>Text</button>
            <WorkflowUploadButton />
          </div>
          {selectedPanel}
        </div>
        <WorkflowDownloadButton />
      </div>
    </fieldset>
  )
}
