# i-Vresse workflow builder form React component

This package contains an enhanced version of the [React JSON schema form component](https://github.com/rjsf-team/react-jsonschema-form) with Bootstrap 4 theme.

It adds the following:

- collapsible field
- table field
- bug fixes for checkbox widget and description field
- support for molecule formats (moleculefilepaths, chain, residue) in JSON schema

See [../../docs/uiSchema.md](../../docs/uiSchema.md) how to configure the form.

## Install

```shell
npm install @i-vresse/wb-form
```

## Usage

In a React application

```js
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
```
