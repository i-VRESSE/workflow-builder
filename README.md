# workflow-builder

Graphical interface to build a workflow file

[![Netlify Status](https://api.netlify.com/api/v1/badges/c94745e0-9fbd-44ba-a4ff-1641d686c063/deploy-status)](https://app.netlify.com/sites/wonderful-noether-53a9e8/deploys)
[![Node.js CI](https://github.com/i-VRESSE/workflow-builder/actions/workflows/node.js.yml/badge.svg)](https://github.com/i-VRESSE/workflow-builder/actions/workflows/node.js.yml)

The main branch is published at https://wonderful-noether-53a9e8.netlify.app/

## Develop

Requires [NodeJS](https://nodejs.org/) and [yarn]().

```shell
# Install dependencies
yarn

# Run dev server
yarn dev
# Goto http://localhost:3000
```

### Tests

Tests (**/*.test.tsx?) written in [vitetest](https://vitest.dev/) (a test framework similar to [jest](https://jestjs.io/)) can be run with:

```shell
yarn test run
```

To run tests with code coverage use

```shell
yarn  test run --coverage
```

Creates `coverage/` directory with HTML and LCOV report.

### Linting

```shell
yarn lint
```

To autofix lint errors use

```shell
yarn lint --fix
```

To generate JSON report use

```shell
yarn lint --report json > eslint.report.json
```

### Build

To build production distribution run

```shell
yarn build
```

Which will create `dist/` directory which should be hosted on the web somewhere.
