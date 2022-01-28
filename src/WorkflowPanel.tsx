import { useRef, useState } from 'react'
import { TextPanel } from './TextPanel'
import { useWorkflow } from './store'
import { VisualPanel } from './VisualPanel'

type ITab = 'text' | 'visual'

export const WorkflowPanel = (): JSX.Element => {
  const uploadRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<ITab>('visual')
  const { loadWorkflowArchive, save } = useWorkflow()
  const selectedPanel = tab === 'visual' ? <VisualPanel /> : <TextPanel />
  const visualTabStyle = { fontWeight: tab === 'visual' ? 'bold' : 'normal' }
  const textTabStyle = { fontWeight: tab === 'text' ? 'bold' : 'normal' }

  async function uploadWorkflow (event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    if (event.target.files == null) {
      return
    }
    const file = event.target.files[0]
    const url = URL.createObjectURL(file)
    await loadWorkflowArchive(url)
    URL.revokeObjectURL(url)
  }
  return (
    <fieldset>
      <legend>Workflow</legend>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexFlow: 'column', height: '90vh' }}>
        <div>
          <div className='btn-group'>
            <button className='btn btn-light' style={visualTabStyle} onClick={() => setTab('visual')}>Visual</button>
            <button className='btn btn-light' style={textTabStyle} onClick={() => setTab('text')}>Text</button>
          </div>
          <button className='btn btn-link' onClick={() => uploadRef.current?.click()}>
            Upload
            <input
              type='file'
              accept='application/zip,.zip'
              onChange={uploadWorkflow}
              ref={uploadRef}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
          </button>
          {selectedPanel}
        </div>
        <button className='btn btn-primary' onClick={save}>Download archive</button>
      </div>
    </fieldset>
  )
}
