# @i-vresse/wb-core

[![TS-Standard - Typescript Standard Style Guide](https://badgen.net/badge/code%20style/ts-standard/blue?icon=typescript)](https://github.com/standard/ts-standard)
[![npmjs.com](https://img.shields.io/npm/v/@i-vresse/wb-core.svg?style=flat)](https://www.npmjs.com/package/@i-vresse/wb-core)
[![Documentation](https://img.shields.io/badge/docs-blue)](https://i-vresse.github.io/workflow-builder/core/docs/)
[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/i-VRESSE/workflow-builder/tree/main/packages/core)

React components and hooks to construct a workflow builder application.
The workflow builder application allows you to create a complex TOML formatted config file based on a set of JSON schemas.

Below is a screencast of [haddock3 download app](https://github.com/i-VRESSE/workflow-builder/tree/main/apps/haddock3-download) which is made using this package.

![Screencast](https://github.com/i-VRESSE/workflow-builder/raw/main/docs/demo.gif)

Part of [i-VRESSE/workflow-builder](https://github.com/i-VRESSE/workflow-builder) monorepo.

## Example

To create an app with a single global parameter and a single node with a single parameter.

Create vite React project and install the core package with

```shell
npm create vite my-ivresse-app -- --template react-ts
cd my-ivresse-app
npm install
npm install @i-vresse/wb-core bootstrap@4
```

Rewrite `src/main.tsx` to include wrapper component for global state, notifications and drag-n-drop support.

```jsx
...
import { Wrapper } from '@i-vresse/wb-core'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <Wrapper>
      <App />
    </Wrapper>
  </React.StrictMode>,
  document.getElementById('root')
)
```

Rewrite `src/App.tsx` to combine the components of the `@i-vresse/wb-core` package to make an app

```jsx
import { useEffect } from "react";
import {
  CatalogPanel,
  FormActions,
  NodePanel,
  WorkflowPanel,
} from "@i-vresse/wb-core";
import { useSetCatalog } from "@i-vresse/wb-core/dist/store";
import { prepareCatalog } from "@i-vresse/wb-core/dist/catalog";
import "bootstrap/dist/css/bootstrap.min.css";
import "@i-vresse/wb-form/dist/index.css";

function App() {
  const setCatalog = useSetCatalog();
  useEffect(() => {
    const catalog = {
      title: "Some title",
      nodeLabel: "Workflow node",
      global: {
        schema: {
          type: "object",
          properties: {
            parameterY: {
              type: "string",
            },
          },
        },
        uiSchema: {},
      },
      categories: [
        {
          name: "cat1",
          description: "First category",
        },
      ],
      nodes: [
        {
          category: "cat1",
          description: "Description of somenode",
          id: "somenode",
          label: "Some node",
          schema: {
            type: "object",
            properties: {
              parameterX: {
                type: "string",
              },
            },
          },
          uiSchema: {},
        },
      ],
      examples: {},
    };
    setCatalog(prepareCatalog(catalog)); // On mount configure catalog
  }, []);
  return (
    <table>
      <tr>
        <td>
          <CatalogPanel />
        </td>
        <td>
          <WorkflowPanel/>
        </td>
        <td style={{verticalAlign: 'top'}}>
          <NodePanel />
          <FormActions />
        </td>
      </tr>
    </table>
  );
}
export default App;
```

Example is running [here](https://i-vresse.github.io/workflow-builder/core/storybook-static/?path=/story/wrapper--example-app).

With the example you can do a couple of things:

* Configure the global parameters 
  * By clicking the `global paramters` button.
  * Make a change to the value
  * Pressing `Submit` button to store the changes.
  * In middle column switch to text mode to see the TOML formatted config file with the global parameter.
  * Pressing `Cancel` button to close the form for the global parameters
* Add a node to the workflow
  * By clicking on `somenode` button or by hovering over the `somenode` button and use the grip to drag it over to the middle column.
  * The form for the node is rendered. Similar to global parameters.
* Add multiple nodes 
  * By repeating clicking on `somenode` button or by hovering over the `somenode` button and use the grip to drag it over to the middle column, insert new node where ever you want in the list by dragging it there.
  * Reorder nodes by hovering over one of them to get grip icon and dragging the node by its grip icon.
  * Delete node by hovering over one of them and pressing the `X` button.

More applications can be found at [https://github.com/i-VRESSE/workflow-builder/tree/main/apps](https://github.com/i-VRESSE/workflow-builder/tree/main/apps) which include ways to import, export and run the workflow.

## API documentation

API documentation of main branch is at [https://i-vresse.github.io/workflow-builder/core/docs/](https://i-vresse.github.io/workflow-builder/core/docs/).

The API documentation can be generated with

```shell
yarn apidocs
```

Will generate a [docs/index.html](docs/index.html).

The API docs exclude React components, the docs for the React components can be seen at
[https://i-vresse.github.io/workflow-builder/core/storybook-static/](https://i-vresse.github.io/workflow-builder/core/storybook-static/)

Or generated locally with

```shell
yarn storybook
```

Which starts a storybook server on http://localhost:6008
