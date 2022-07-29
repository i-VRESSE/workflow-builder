# i-Vresse workflow builder form React component

[![TS-Standard - Typescript Standard Style Guide](https://badgen.net/badge/code%20style/ts-standard/blue?icon=typescript)](https://github.com/standard/ts-standard)

This package contains an enhanced version of the [React JSON schema form component](https://github.com/rjsf-team/react-jsonschema-form) with Bootstrap 4 theme.

It adds the following:

- collapsible field
- table field
- bug fixes for checkbox widget and description field
- support for molecule formats (moleculefilepaths, chain, residue) in JSON schema
- index column for array types

See [/docs/uiSchema.md](https://github.com/i-VRESSE/workflow-builder/blob/main/docs/uiSchema.md) how to configure the form.

Part of [i-VRESSE/workflow-builder](https://github.com/i-VRESSE/workflow-builder) monorepo.

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

## API documentation

API documentation of main branch is at [https://i-vresse.github.io/workflow-builder/form/docs/](https://i-vresse.github.io/workflow-builder/form/docs/).

The API documentation can be generated with

```shell
yarn apidocs
```

Will generate a [docs/index.html](docs/index.html).

The API docs exclude React components, their docs can be seen at 
[https://i-vresse.github.io/workflow-builder/form/storybook-static/](https://i-vresse.github.io/workflow-builder/form/storybook-static/)

Or generated locally with

```shell
yarn storybook
```

Which starts a storybook server on http://localhost:6007

