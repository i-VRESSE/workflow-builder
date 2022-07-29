# UI schema

The global and node parameters are edited in a form generated from the JSON schema.
To customize the look and feel of the form the `uiSchema` can be defined in the catalog.
For example rendering a radio group or a text area can be done by filling the `uiSchema`.

The [react-json-schema-form](https://react-jsonschema-form.readthedocs.io/en/latest/api-reference/uiSchema/) docs describes the uiSchema format and which built-in fields are avaiable.

Besides the built-in react-json-schema-form uiSchema fields, the workflow builder adds the following:

## ui:field: collapsible

An property of type object can be rendered as a collapsible sub-form with

```json
{
    "prop1": {
        "ui:field": "collapsible"
    }
}
```

This will render the children of `prop1` in a initially collapsed sub-form.
To expand press the expand icon button.

### Initially expanded

Render the sub-form initially expanded with

```json
{
    "prop1": {
        "ui:field": "collapsible",
        "ui:collapsed": true
    }
}
```

Or alternativly using `ui:options` with

```json
{
    "prop1": {
        "ui:field": "collapsible",
        "ui:options": {
            "collapsed": true
      }
    }
}
```

## ui:group

```json
{
    "prop1": {
        "ui:group": "<group name>"
    }
}
```

Any property with a group uiSchema field will be grouped together with other properties with the same group in the form. The generated toml file will have the props ungrouped.
The group will also be collapsible and collapsed by default.

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

To hide titles and descriptions in table rows {"ui:field": "table"}) a css file must be imported.

```js
import '@i-vresse/wb-form/index.css'
```

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

## ui:indexable

When you have many rows it can be hard to tell the index of each row. Add `indexable` ui option to render an additional label or column with the row index.

When `prop1` is an array use the default array renderer with

```json
{
    "prop1": {
        "ui:indexable": true
    }
}
```

When `prop1` is an array of objects use a table field and index column with

```json
{
    "prop1": {
        "ui:field": "table",
        "ui:options": {
            "indexable": true // Alternative way to write "ui:indexable": true
        }
    }
}
```
