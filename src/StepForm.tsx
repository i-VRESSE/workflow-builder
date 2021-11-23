import { INode, IStep, useWorkflow } from "./store"
import { withTheme, utils } from "@rjsf/core";
import { Theme } from "@rjsf/bootstrap-4";

const registry = utils.getDefaultRegistry();
const defaultFileWidget = registry.widgets["FileWidget"];
(Theme as any).widgets["FileWidget"] = defaultFileWidget;
const Form = withTheme(Theme);

interface IProp {
    node: INode
    step: IStep
}

export const StepForm = ({ node, step }: IProp) => {
    const {setParameters} = useWorkflow()
    const parameters = step.parameters
    const uiSchema = node.uiSchema ? node.uiSchema : {}
    return (
        <>
            <h1>{node.label} ({node.id})</h1>
            <div>
                {node.description}
            </div>
            <Form schema={node.schema} uiSchema={uiSchema} formData={parameters} onSubmit={({formData}) => setParameters(formData)}/>
        </>
    )
}