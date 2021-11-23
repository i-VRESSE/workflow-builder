import { useState } from "react"
import { CodePanel } from "./CodePanel"
import { useCodeUrl } from "./store"
import { VisualPanel } from "./VisualPanel"

type ITab = 'code' | 'visual'

export const WorkflowPanel = () => {
    const [tab, setTab] = useState<ITab>('visual')
    const selectedPanel = tab === 'visual' ? <VisualPanel /> : <CodePanel />
    const visualTabStyle = { fontWeight: tab === 'visual' ? 'bold' : 'normal' }
    const codeTabStyle = { fontWeight: tab === 'code' ? 'bold' : 'normal' }
    const url = useCodeUrl()
    return (
        <fieldset>
            <legend>Workflow</legend>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexFlow: 'column', height: '90vh' }}>
                <div>
                    <div>
                        <button style={visualTabStyle} onClick={() => setTab('visual')}>Visual</button>
                        <button style={codeTabStyle} onClick={() => setTab('code')}>Code</button>
                    </div>
                    {selectedPanel}
                </div>
                <a className="btn btn-primary" href={url} download="workflow.cfg">Download</a>
            </div>
        </fieldset>
    )
}