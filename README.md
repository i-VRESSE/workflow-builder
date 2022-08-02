# workflow-builder

Graphical interface to build a workflow file

[![Netlify Status](https://api.netlify.com/api/v1/badges/c94745e0-9fbd-44ba-a4ff-1641d686c063/deploy-status)](https://app.netlify.com/sites/wonderful-noether-53a9e8/deploys)
[![Node.js CI](https://github.com/i-VRESSE/workflow-builder/actions/workflows/node.js.yml/badge.svg)](https://github.com/i-VRESSE/workflow-builder/actions/workflows/node.js.yml)
[![TS-Standard - Typescript Standard Style Guide](https://badgen.net/badge/code%20style/ts-standard/blue?icon=typescript)](https://github.com/standard/ts-standard)
[![codecov](https://codecov.io/gh/i-VRESSE/workflow-builder/branch/publish-packages/graph/badge.svg?token=ZT000QUOUW)](https://codecov.io/gh/i-VRESSE/workflow-builder)
[![fair-software.eu](https://img.shields.io/badge/fair--software.eu-%E2%97%8F%20%20%E2%97%8F%20%20%E2%97%8B%20%20%E2%97%8F%20%20%E2%97%8B-orange)](https://fair-software.eu)

The haddock3-download application of the main branch is published at https://wonderful-noether-53a9e8.netlify.app/

The builder allows you to create a complex TOML formatted config file based on a set of JSON schemas.

![Image](docs/demo.gif)

The workflow builder is organized as a monorepo with packages and apps.

* [haddock3-download app](apps/haddock3-download): To construct haddock3 workflow and download it for offline running
* [haddock3-submit app](apps/haddock3-submit): To construct haddock3 workflow and submit it for online running
* [kitchensink app](apps/kitchensink): Demonstration of features of workflow builder
* [@i-vresse/wb-core package](packages/core): React components, state management, input/output functions to create an application
* [@i-vresse/wb-form package](packages/form): Web Form based on JSON Schema
* [haddock3_catalog package](packages/haddock3_catalog): Generate script and storage place for haddock3 catalogs

## Develop

Requires [NodeJS](https://nodejs.org/) and [yarn](https://yarnpkg.com/) (tested with v3.2.1).

```shell
# Install dependencies
yarn

# Run dev servers
yarn dev
```

* Goto http://localhost:3000 for haddock3-download app
* Goto http://localhost:3001 for haddock3-submit app
* Goto http://localhost:3002 for kitchensink app

### Unit tests

Tests (**/*.test.tsx?) written in [vitetest](https://vitest.dev/) can be run with:

```shell
yarn test -- run
```

To run tests with code coverage use

```shell
yarn  test -- run --coverage
```

Creates `**/coverage/` directory with HTML and LCOV report.

### Integration tests

The integration tests (`**/integration-tests/**.spec.ts`) are written in [playwright](https://playwright.dev/).

Before running test ensure browsers are installed with

```shell
cd apps/haddock3-download
npx playwright install chromium
```

Tests can be run with

```shell
yarn test:integration
```

To run in a non-headless browser use

```shell
yarn test:integration --headed
```

The browser will pause when a test calls `await page.pause()`, so you can investigate current state.

There is a VS code extension to run integration tests inside editor.

### Linting

```shell
yarn lint
```

To autofix lint errors use

```shell
yarn lint -- --fix
```

To generate JSON report use

```shell
yarn lint -- --report json > eslint.report.json
```

### Build

To build production distribution run

```shell
yarn build
```

Which will create `apps/*/dist/` directories which should be hosted on the web somewhere.
The build also creates `packages/*/dist` directories which should be published to npmjs.com.

### Component development

Components can be developed/tested/documented using [storybook](https://storybook.js.org/).

The storybooks of the main branch are hosted at

* [storybook for core package](https://i-vresse.github.io/workflow-builder/core/storybook-static/)
* [storybook for form package](https://i-vresse.github.io/workflow-builder/form/storybook-static/)

Storybook can be started locally with

```shell
yarn storybook
```

* Goto http://localhost:6008 for storybook of core package
* Goto http://localhost:6007 for storybook of form package


## Format

### Workflow archive

The workflow builder creates a zip file with a workflow configuration file called `workflow.cfg` in [TOML format](https://toml.io).
The configuration file contains paths to input files which are included in the zip file.

## Workflow configuration file

The workflow configuration file consists out of 2 parts:

1. Global parameters, which are available to engine and each node.
2. Tables with parameters for each node the workflow should run.

An uploaded workflow configuration file can contain tables with the same name (this is more lenient then the TOML format).
A generated workflow configuration file with the same node twice will have a TOML string with `[somenode]` and `['somenode.2']` table respectively.

### Catalog

The catalog is a YAML formatted file which tells the app what nodes are available. In has the following info:

1. global: Description of global parameters
    * schema: What parameters are valid. Formatted as JSON schema draft 7.
    * uiSchema: How the form for filling the parameters should be rendered.
    * tomlSchema: How toml keys are mapped to in-memory representation.
2. nodes: Description of available nodes.
    * id: Identifier of node, for computers
    * label: Label of node, for humans
    * category: Category to which node belongs
    * description: Text describing what node needs, does and produces.
    * schema: What parameters are valid. Formatted as JSON schema draft 7.
    * uiSchema: How the form for filling the parameters should be rendered.
    * tomlSchema: How toml keys are mapped to in-memory representation.
3. catagories: Descriptions of node categories
    * name: Name of category
    * description: Description of category
    * collapsed (optional): Whether category should be rendered collapsed initially
4. examples: Title and link to example workflows
    * map with title as key and link as value
5. title: Title of the catalog

### schema

See [docs/schema.md](docs/schema.md).

#### uiSchema

See [docs/uiSchema.md](docs/uiSchema.md).

### tomlSchema

See [docs/tomlSchema.md](docs/tomlSchema.md).

### Catalog index

In the worklfow builder you can pick a catalog from a list. This list gets downloaded from [public/catalog/index.json](apps/haddock3-download/public/catalog/index.json) and is formatted like

```json
[
    ["<title of catalog>", "<URL of catalog YAML file>"]
]
```

The first catalog in the index.json file will be shown when you open the app.

The haddock3 catalogs can be generated by a Python script in [packages/haddock3_catalog](packages/haddock3_catalog) from the [haddock3 library](https://github.com/haddocking/haddock3). The haddock3 catalogs and example are symbolicly linked to `/app/*/public`.
