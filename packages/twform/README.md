# i-Vresse workflow builder form tailwind React component

Uses:

- react-hook-form for form management
- ajv for JSON schema validation
- tailwind for styling
- shadcn/ui for styled components

This component is heavily inspired by [react-jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form), but 
consumer must supply all the fields, widgets to render, making it easier to style.

## Development

```shell
npm run dev
```

Renders [src/App.tsx](src/App.tsx) which shows all features of the form component.

Run to run stories written with ladle:

```shell
npx ladle serve
```

## Usage

The form uses tailwindcss for styling. To capture the css classes used in the form you need to add the following to your
tailwind.config.js:

```js
module.exports = {
  // ...
  content: [
    // ...
    './node_modules/@i-vresse/wb-tailwind-form/src/components/ui/**/*.tsx',
  ],
}
```



## Glossary

- **Field**
- **Widget**
- **Schema**
- **UI Schema**
