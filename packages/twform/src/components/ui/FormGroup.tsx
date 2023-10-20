import { JSONSchema7 } from "json-schema";
import { Separator } from "./separator";

interface FormGroupProps {
    schema: JSONSchema7;
    name: string;
    children: JSX.Element[]
}

export function FormGroup({ schema, name, children }: FormGroupProps) {
    return (
        <div className="shadow-md px-2">
            <h3 className="text-lg font-medium">{schema.title ?? name}</h3>
            <p>{schema.description}</p>
            <Separator />
            <div>
                {children}
            </div>
        </div>
    );
}