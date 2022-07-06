import { useState } from "react";
import { Form } from "@i-vresse/wb-form";

// JSON schema draft-07
const schema = {
    type: "object",
    properties: {
        group1: {
            type: "object",
            properties: {
                prop1: {
                    type: "string",
                },
            },
        },
    },
};

const uiSchema = {
    group1: {
        "ui:field": "collapsible",
    },
};

export const Page = () => {
    const [formData, setFormData] = useState({});
    return (
        <div>
            <Form
                schema={schema}
                uiSchema={uiSchema}
                formData={formData}
                onSubmit={({ formData }) => setFormData(formData)}
            />
            <pre>{JSON.stringify(formData, undefined, 4)}</pre>
        </div>
    );
};
