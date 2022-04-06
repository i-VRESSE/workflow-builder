# Schema

The global and node parameters are validated against a [JSON schema](https://json-schema.org/).
Also the parameters are edited in a form generated from the JSON schema.

The schema should formatted according to the [JSON schema draft 7](https://json-schema.org/specification-links.html#draft-7) specification.

Besides the keywords and formats defined in the specification and in [ajv-formats](https://github.com/ajv-validator/ajv-formats), the workflow builder adds the following:

## keyword maxItemsFrom

The `maxItemsFrom` keyword can be used to limit the number of items in an array defined in a schema of a node by the same number of items in a global parameter.

For example to make the `maxItems` of the `nprop` property in the node schema have the same as the length of the global parameter named `gprop` use the following catalog.

```yaml
title: Test catalog
global:
  uiSchema: {}
  tomlSchema: {}
  schema:
    type: object
    properties:
      gprop:
        type: array
        items:
          type: string
categories:
- name: cat1
  description: Category 1
nodes:
- id: node1
  category: cat1
  uiSchema: {}
  tomlSchema: {}
  schema:
    type: object
    properties:
      nprop:
        type: array
        items:
          type: string
        maxItemsFrom: gprop
```

When global parameters looks like

```json
{
    "gprop": ["a", "b"]
}
```

Then the schema used for validation and form generation of the node will be

```json
{
    "type": "object",
    "properties": {
        "nprop": {
            "type": "array",
            "items": {
                "type": "string"
            },
            "maxItems": 2
        }
    }
}
```

The `maxItemsFrom` keyword only works when the property is of type array and the global parameter is also an array.
