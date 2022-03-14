# UI schema

The global and node parameters are edited in a form generated from the JSON schema.
To customize the look and feel of the form the uiSchema can be used.
For example rendering a radio group or a text area. The [react-json-schema-form](https://react-jsonschema-form.readthedocs.io/en/latest/api-reference/uiSchema/) docs describes the uiSchema format.

Besides the built-in react-json-schema-form uiSchema fields the workflow builder adds the following.

## ui:group

```json
{
    "prop1": {
        "ui:group": "<group name>"
    }
}
```

Any property with a group uiSchema field will be grouped together with other properties with the same group in the form. The generated toml file will have the props ungrouped.

## ui:field: table

A property which is an array of objects can be rendered as a table with

```json
{
    "prop1": {
        "ui:field": "table"
    }
}
```

Each array item will be a row and each object property will be a column.
The header cells show the title of the property together with a popup for the description.
The other cells show the property without any titles or descriptions.

### Column widths

The column widths can be customized.

For example given an array of objects with properties `prop2` and `prop3`. To make `prop3` column have `40%` of the total table width use:

```json
{
    "prop1": {
        "ui:field": "table",
        "ui:options": {
            "widths": {
                "prop3": "40%"
            }
        }
    }
}
```
