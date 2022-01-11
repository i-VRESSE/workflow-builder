import { withTheme, utils } from "@rjsf/core";
import { Theme } from "@rjsf/bootstrap-4";
import { useFiles, useWorkflow } from "./store"
import { IStep, INode } from "./types";
import { internalizeDataUrls } from "./dataurls";

// TODO workaround for broken bootsrap-4 file widget, see https://github.com/rjsf-team/react-jsonschema-form/issues/2095
// this workaround is not drawing the title for the field
const registry = utils.getDefaultRegistry();
const defaultFileWidget = registry.widgets["FileWidget"];
(Theme as any).widgets["FileWidget"] = defaultFileWidget;
const Form = withTheme(Theme);

interface IProp {
    node: INode
    step: IStep
}

export const StepForm = ({ node, step }: IProp) => {
    const { setParameters } = useWorkflow()
    const { files } = useFiles();
    const parameters = internalizeDataUrls(step.parameters, files)
    const uiSchema = node.uiSchema ? node.uiSchema : {}
    return (
        <>
            <h1>{node.label} ({node.id})</h1>
            <div>
                {node.description}
            </div>
            <Form schema={node.schema} uiSchema={uiSchema} formData={parameters} onSubmit={({ formData }) => setParameters(formData)} />
        </>
    )
}