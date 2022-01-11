# workflow-builder

Graphical interface to build a workflow file

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
