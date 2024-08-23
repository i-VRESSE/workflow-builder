# Schema

The global and node parameters are validated against a [JSON schema](https://json-schema.org/).
Also the parameters are edited in a form generated from the JSON schema.

The schema should formatted according to the [JSON schema draft 7](https://json-schema.org/specification-links.html#draft-7) specification.

Besides the keywords and formats defined in the specification and in [ajv-formats](https://github.com/ajv-validator/ajv-formats), the workflow builder adds the following:

## Keyword maxItemsFrom

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

## Format moleculefilepaths, chain and residue

To restrict the residues sequence numbers or to restrict the possible chains. You can use the `residue` and `chain` formats.

To compute the valid residues sequence numbers of a property the builder needs to know which PDB file that belongs to that property. This is done by annotating the parent array property with `maxItemsFrom: <global parameter name which holds molecule paths>` and annotating that global parameter with `format: moleculefilepaths`.

For example a schema of a node

```yaml
    type: object
    properties:
      seg:
        type: array
        maxItemsFrom: molecules
        title: Segments
        items:
          type: array
          title: Segments of a molecule
          items:
            type: object
            properties:
              chain:
                title: Chain
                type: string
                format: chain
              sta:
                title: Starting residue number
                type: number
                format: residue
              end:
                title: Ending residue number
                type: number
                format: residue
```

and a global schema

```yaml
    type: object
    properties:
      molecules:
        title: Input Molecules
        type: array
        format: moleculefilepaths
        items:
          type: string
          format: uri-reference
```

and a PDB file was uploaded to the global parameters

```json
{
  "molecules": ["abcd.pdb"]
}
```

and `abcd.pdb` file has chain A and B with residues 1, 2, 3 and 4.

Then the form will have restricted the `chain` prop to only allow `A` and `B`
and will have restricted the sta and end prop to only allow 1, 2, 3 and 4.

## If then else

The `if`, `then` and `else` keywords can be used to [conditionally apply a schema](https://json-schema.org/understanding-json-schema/reference/conditionals#ifthenelse).

For example to have the `foo` property only if the `bar` property is false use:

```yaml
    type: object
    properties:
      bar:
        type: boolean
    if:
      properties:
        bar:
          const: true
    then: {}
    else:
      properties:
        foo:
          type: string
```

Only supports simple const condition with one or more properties and not complex conditions like patterns. Also only a single if/tnen/else block per object is supported. It can be combined with [groups](uiSchema.md#uigroup).
