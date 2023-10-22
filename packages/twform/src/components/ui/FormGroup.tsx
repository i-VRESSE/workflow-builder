import { JSONSchema7 } from "json-schema";
import { Separator } from "./separator";

interface FormGroupProps {
    schema: JSONSchema7;
    name: string;
    children: JSX.Element[]  | JSX.Element;
}

export function FormGroup({ schema, name, children }: FormGroupProps) {
    return (
        <div className="shadow-md p-2">
            <h3 className="text-lg font-medium">{schema.title ?? name}</h3>
            <p>{schema.description}</p>
            <Separator />
            <div>
                {children}
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FormCollapsible({ schema, name, uiSchema, children }: FormGroupProps & { uiSchema: any }) {
    return (
        <details className="shadow-md p-2" open={uiSchema['ui:open']}>
            <summary className="text-lg font-medium">{schema.title ?? name}</summary>
            <p>{schema.description}</p>
            <Separator />
            <div>
                {children}
            </div>
        </details>
    );
}