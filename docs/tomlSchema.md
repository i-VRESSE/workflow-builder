# tomlSchema

Any array or object value can be written in different ways to a toml file.
Use the toml schema in the catalog to overwrite the default behaviour.

The default behavior is to write the value as a nested structure like

In memory have parameter object like

```js
{
    key1:  [ 1, 2 ] // Array of scalar
    key2: [ "a", "b" ]  // Array of scalar
    key3: { a: 1, b: 2}  // Object as inline table
    key4: { a: [ 1, 2 ]}  // Object with array of scalar
    key5: [ { a: 1 }, { a: 2 }]  // Array with objects
    key6: [ { a: [ 1, 2 ]} ]  // Array with oboject with array of scalar
    key7: [ [ 1, 2], [ 3 ,4 ] ]  // Array of array of scalar
    key7: [ [ { a: 1 }, { a: 2 }], [ { a: 3 } ,{ a: 4 } ] ]  // Array of array of object
}
```

The parameter object JSON shema is defined in the catalog.

The resulting toml would look like

```toml
key1 = [ 1, 2 ]
key2 = [ "a", "b" ]
key3 = { a = 1, b = 2}
key4 = { a = [ 1, 2 ]}
key5 = [ { a = 1 }, { a = 2 }]
key6 = [ { a = [ 1, 2 ]} ]
key7 = [ [ 1, 2], [ 3 ,4 ] ]
key7 = [ [ { a = 1 }, { a = 2 }], [ { a = 3 } ,{ a = 4 } ] ]
```

The tomlSchema object follows the tree structure of the schema hierarchy.

Special keywords in tomlSchema:

1. **indexed**, when true will have array index appended to key
2. **flatten**, when true will have object property names appended to key
3. **sectioned**, when true will write children inside own table (for example `[<module>.<key>]`)
4. **items**, to nest a toml schema for an array item
5. **properties**, to nest a toml schema for an object property

Below are examples of supported toml schema snippets.

## Array of scalars

In toml

```toml
param_1 = 11
param_2 = 22
param_3 = 33
```

In catalog

```yaml
schema:
  type: object
  properties:
    param:
      type: array
      items:
        type: number
tomlSchema:
  param:
    indexed: true
```

In memory

```json
{
  "param": [11, 22, 33]
}
```

## Array of objects

In toml

```toml
name_something_1 = 11
name_else_1 = 22
name_something_2 = 33
name_else_2 = 44
```

In catalog

```yaml
schema:
  type: object
  properties:
    name:
      type: array
      items:
        type: object
        properties:
          something:
            type: number
          else:
            type: number
tomlSchema:
  name:
    indexed: true
    items:
      flatten: true
```

In memory

```json
{
  "name": [{
    "something": 11,
    "else": 22,
  }, {
    "something": 33,
    "else": 44,
  }]
}
```

## Array of array of objects

In toml

```toml
fle_sta_1_1 = 11
fle_end_1_1 = 22
fle_sta_1_2 = 33
fle_end_1_2 = 44
fle_sta_2_1 = 55
fle_end_2_1 = 66
```

In catalog

```yaml
schema:
  type: object
  additionalProperties: false
  properties:
    fle:
      type: array
      description: Outer array is molecule index
      items:
        type: array
        description: Inner array is segment index
        items:
          type: object
          properties:
            sta:
              title: Starting residue number
              type: number
            end:
              title: End residue number
              type: number
          additionalProperties: false
tomlSchema:
  fle:
    indexed: true
    items:
      indexed: true
      items:
        flatten: true
```

In memory

```json
{
    "fle": [
        [
            {
                "sta": 11,
                "end": 22
            },
            {
                "sta": 33,
                "end": 44
            }
        ],
        [
            {
                "sta": 55,
                "end": 66
            }
        ]
    ]
}
```

## Array of objects with object as toml table and scalar array prop

In toml

```toml
[topoaa.mol1]
cyclicpept = false
hisd_1 = 13
hisd_2 = 42

[topoaa.mol2]
cyclicpept = true
hisd_1 = 314
hisd_2 = 512
```

In catalog

```yaml
schema:
  type: object
  properties:
    mol:
      type: array
      items:
        type: object
        properties:
          cyclicpept:
            type: boolean
          hisd:
            type: array
            items:
                type: number
tomlSchema:
  mol:
    indexed: true
    items:
      sectioned: true
      properties:
        hisd:
          indexed: true
```

In memory

```json
{
  "mol": [{
    "cyclicpept": false,
    "hisd": [13, 42]
  }, {
    "cyclicpept": true,
    "hisd": [314, 512]
  }]
}
```
