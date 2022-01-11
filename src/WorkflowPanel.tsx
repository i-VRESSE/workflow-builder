import { useState } from "react"
import { TextPanel } from "./TextPanel"
import { useWorkflow } from "./store"
import { VisualPanel } from "./VisualPanel"

type ITab = 'text' | 'visual'

export const WorkflowPanel = () => {
    const [tab, setTab] = useState<ITab>('visual')
    const { loadWorkflow, save } = useWorkflow();
    const selectedPanel = tab === 'visual' ? <VisualPanel /> : <TextPanel />
    const visualTabStyle = { fontWeight: tab === 'visual' ? 'bold' : 'normal' }
    const textTabStyle = { fontWeight: tab === 'text' ? 'bold' : 'normal' }

    async function uploadWorkflow() {
        // TODO compatible with non-Chrome browsers
        const [fileHandle] = await (window as any).showOpenFilePicker({
            muliple: false
        });
        const file: File = await fileHandle.getFile()
        debugger
        const text = await file.text()
        loadWorkflow(text)
    }
    return (
        <fieldset>
            <legend>Workflow</legend>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexFlow: 'column', height: '90vh' }}>
                <div>
                    <div className="btn-group">
                        <button className="btn btn-light" style={visualTabStyle} onClick={() => setTab('visual')}>Visual</button>
                        <button className="btn btn-light" style={textTabStyle} onClick={() => setTab('text')}>Text</button>
                    </div>
                    <button className="btn btn-link" onClick={uploadWorkflow}>Upload</button>
                    {selectedPanel}
                </div>
                <button className="btn btn-primary" onClick={save}>Download archive</button>
            </div>
        </fieldset>
    )
}