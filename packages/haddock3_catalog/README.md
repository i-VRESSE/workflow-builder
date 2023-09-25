# Generate haddock3 catalog

The haddock3 uses `**/defaults.yaml` files to specify the module parameteres while the i-VRESSE workflow builder uses a [catalog](../../README.md#catalog).
The `./generate_haddock3_catalog.py` script can be used to generate a catalog from the haddock3 defaults.yaml files.

To install haddock3 see https://github.com/haddocking/haddock3/blob/main/docs/INSTALL.md

Run with

```shell
# Reads modules from haddock3 in Python path
./generate_haddock3_catalog.py
# Writes catalog files in public/catalog/ dir

# TODO add command to check JSON schemas are valid.
```

Translations from haddock3 -> i-VRESSE workflow builder:

* module -> node
* generic parameters-> global parameters
* Module info
    * haddock.modules.<catagory>.<module>.__doc__ -> node.label
    * haddock.modules.<catagory>.<module>.HaddockModule.__doc__ -> node.description
* Category info
    * haddock.modules.<catagory>.__doc__ -> category.description
* Module DEFAULT_CONFIG -> JSON schema + UI schema:
    * short -> description
    * long -> $comment
    * type=float or type=integer -> type=number
    * type=list -> type=array
    * type=file -> type=string + format=uri-reference + ui:widget=file
    * type=dir -> type=string + format=uri-reference
    * type missing -> {type:object, parameters: <key/value pairs>}
    * min -> minimum
    * max -> maximum
    * minchars -> minLength
    * maxchars -> maxLength
    * minitems -> minItems
    * maxitems -> maxItems
    * accept -> ui:options={accept: ','.join(...)}
    * choices -> enum
    * explevel -> each explevel gets generated into own catalog
    * group -> ui:group in ui schema
    * expandable (*_1) -> arrays and objects + tomlschema
    * mol_* or *_*_1_1 -> maxItemsFrom:molecules aka array should have same size as global molecules parameter
    * 'residue number' in title -> format:residue
    * 'chain' or 'segment id' in title -> format:chain
