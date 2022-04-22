#!/usr/bin/env python3
"""
Requires haddock3, fcc and pyyaml

Run with

```shell
# Reads modules from haddock3 in Python path
util/generate_haddock3_catalog.py
# Writes catalog files in public/catalog/ dir
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

TODO move script outside workflow-builder repo as this repo should be generic and not have any haddock specific scripts
"""

import argparse
import importlib
import json
import logging
from math import isnan
from pathlib import Path
import re
import sys
from yaml import dump, load, Loader

from haddock.modules import modules_category
from haddock import config_expert_levels, _hidden_level

def argparser_builder():
    parser = argparse.ArgumentParser()
    parser.add_argument('--out_dir', type=Path, default='public/catalog')
    parser.add_argument('--root_url', type=Path, default='/catalog')
    return parser

def collapse_expandable(config):
    """
    The haddock3 defaults.yaml files define complex shape inside the parameter name.
    The workflow builder uses type:array, type:object from JSON schema to define complex data types.

    The method converts the shape in parameter name into a shortened parameter name and a shape
    1. arrays of scalars (X_1 -> X:[1]),
    2. arrays of objects (X_Y_1 -> X:[{Y}]),
    3. array of arrays of scalars (X_1_1 -> X:[[1]]) and
    4. array of arrays of object (X_Y_1_1 -> X:[[{Y}]])

    """
    array_of_scalar = r'(\w+)_1'
    array_of_object = r'(\w+)_(\w+)_1'
    array_of_array_of_scalar = r'(\w+)_1_1'
    array_of_array_of_object = r'(\w+)_(\w+)_1_1'
    skip = r'\w+?(_\d\d?)(_\d\d?)?'
    must_be_array_of_scalar = {'mol_fix_origin_1', 'mol_shape_1'}
    new_config = {}
    for k, v in config.items():
        logging.info(f'Processing var: {k}')
        if (match := re.match(skip, k)) and not (match.groups()[0] == '_1' and (match.groups()[1] in {None,'_1'})):
            logging.info(f'SKipping {k} as their schema will be captured by first index.')
            continue
            # TODO nice to store maxitems with type:array
            # for example rair_end_20_1 -> outer array should have maxitems:20
            # for example int_20_20 ->  both array should have maxitems:20
        elif match := re.match(array_of_array_of_object, k):
            p, n = match.groups()
            if p not in new_config:
                new_config[p] = {
                    'dim': 2, 
                    'properties': {}, 
                    'type': 'list',
                    'maxItemsFrom': 'molecules'
                }
            new_config[p]['properties'][n] = v
            if 'group' in v:
                # Move group from nested prop to outer array
                new_config[p]['group'] = v['group']
                del v['group']
        elif match := re.match(array_of_array_of_scalar, k):
            p, = match.groups()
            new_config[p] = {
                'type': 'list',
                'dim': 2,
                'items': v
            }
            if 'group' in v:
                new_config[p]['group'] = v['group']
                del v['group']
        elif (match := re.match(array_of_object, k)) and k not in must_be_array_of_scalar:
            p, n = match.groups()
            if p not in new_config:
                new_config[p] = {'dim': 1, 'properties': {}, 'type': 'list'}
            new_config[p]['properties'][n] = v
            if 'group' in v:
                new_config[p]['group'] = v['group']
                del v['group']
        elif match := re.match(array_of_scalar, k):
            p, = match.groups()
            new_config[p] = {
                'type': 'list',
                'dim': 1,
                'items': v
            }
            if k.startswith('mol_'):
                new_config[p]['maxItemsFrom'] = 'molecules'
            if 'group' in v:
                new_config[p]['group'] = v['group']
                del v['group']
        else:
            new_config[k] = v

    return new_config

def residue_like(schema):
    return 'residue number' in schema['title'].lower()

def chain_like(key, schema):
    return 'chain' in key or 'Segment ID' in schema['title']

def config2schema(config):
    """Translate haddock3 config file of a module to JSON schema"""
    properties = {}
    uiSchema = {}
    tomlSchema = {}

    required = []
    collapsed_config = collapse_expandable(config)
    for k, v in collapsed_config.items():
        prop = {}
        prop_ui = {}
        prop_toml = {}
        if 'default' in v:
            prop["default"] = v['default']
        elif 'type' in v and v['type'] != 'list':
            # If there is no default then user must supply a value so prop is required
            required.append(k)
        if 'title' in v and v['title'] != 'No title yet':
            prop['title'] = v['title']
        if 'short' in v and v['short'] != 'No short description yet':
            prop['description'] = v['short']
        if 'long' in v and v['long'] != 'No long description yet':
            prop['$comment'] = v['long']
        if 'type' not in v:
            # if not type field treat value as dict of dicts
            # TODO instead of removing group and explevel from mol1.prot_segid dict do proper filtering and support group recursivly
            config2 = {
                k2:{
                    k3:v3 for k3,v3 in v2.items() if k3 not in {'group','explevel'}
                } for k2,v2 in v.items() if k2 not in {'explevel', 'title', 'short', 'long', 'group'}
            }
            schemas = config2schema(collapse_expandable(config2))
            prop.update({
                'type': 'array',
                'items': schemas['schema'],
            })

            if schemas['uiSchema']:
                prop_ui['items'] = schemas['uiSchema']

            prop_toml = {
                'indexed': True,
                'items': {
                    'sectioned': True
                }
            }
            if schemas['tomlSchema']:
                prop_toml['items']['properties'] = schemas['tomlSchema']
            # Rename as parameter is array and does not need extra index
            if k == 'mol1':
                k = 'mol'
        elif v['type'] == 'boolean':
            prop['type'] = "boolean"
        elif v['type'] in {'float', 'integer'}:
            prop['type'] = "number"
            if 'max' in v:
                prop['maximum'] = v['max']
            if 'min' in v:
                prop['minimum'] = v['min']
            if 'default' in v and isnan(v['default']):
                # TODO handle nan's more gracefully, instead of now just deleting it
                del prop['default']
            if residue_like(v):
                prop['format'] = 'residue'
        elif v['type'] == 'file':
            prop['type'] = 'string'
            prop['format'] = 'uri-reference'
            if 'default' in v:
                # TODO handle clustfcc.executable.default = src/contact_fcc gracefully, now default is omitted,
                # it should be treated as some path outside workflow archive or a file inside the workflow archive
                # paths can not have defaults
                del prop['default']

            # rjsf needs to render a file upload field which can be configured in uiSchema
            prop_ui ={
                "ui:widget": "file"
            }

            if 'accept' in v:
                prop_ui["ui:options"] = { "accept": ",".join(v['accept'])}
        elif v['type'] == 'dir':
            prop['type'] = 'string'
            prop['format'] = 'uri-reference'
            if 'default' in v:
                # paths can not have defaults
                del prop['default']
        elif v['type'] == 'string':
            prop['type'] = 'string'
            if 'minchars' in v:
                prop['minLength'] = v['minchars']
            if 'maxchars' in v:
                prop['maxLength'] = v['maxchars']
            if 'choices' in v:
                prop['enum'] = v['choices']
            if v['default'] == '':
                del prop['default']
            if chain_like(k, v):
                prop['format'] = 'chain'
        elif v['type'] == 'list':
            prop['type'] = "array"
            if 'minitems' in v:
                prop['minItems'] = v['minitems']
            if 'maxitems' in v:
                prop['maxItems'] = v['maxitems']
            elif 'maxItemsFrom' in v:
                prop['maxItemsFrom'] = v['maxItemsFrom']
            if 'properties' in v:
                obj_schemas = config2schema(v['properties'])
                if v['dim'] == 1:
                    prop['items'] = obj_schemas['schema']
                    prop_ui = { 'ui:field': 'table'}
                    if obj_schemas['uiSchema']:
                        prop_ui['items'] = obj_schemas['uiSchema']
                    prop_toml = {
                        'indexed': True,
                        'items': {
                            'flatten': True
                        }
                    }
                elif v['dim'] == 2:
                    prop['items'] = {
                        'type': 'array',
                        'items': obj_schemas['schema']
                    }
                    prop_ui = {'items': { 'ui:field': 'table'}}
                    if obj_schemas['uiSchema']:
                        prop_ui['items']['items'] = obj_schemas['uiSchema']
                    prop_toml = {
                        'indexed': True,
                        'items': {
                            'indexed': True,
                            'items': {
                                'flatten': True
                            }
                        }
                    }
                else:
                    raise Exception('Unknown dim')
            elif 'items' in v:
                obj_schemas = config2schema({'a': v['items']})
                if v['dim'] == 1:
                    prop['items'] = obj_schemas['schema']['properties']['a']
                    if 'a' in obj_schemas['uiSchema']:
                        prop_ui = {
                            "items": obj_schemas['uiSchema']['a']
                        }
                    prop_toml = {
                        'indexed': True
                    }
                elif v['dim'] == 2:
                    prop['items'] = {
                        'type': 'array',
                        'items': obj_schemas['schema']['properties']['a']
                    }
                    if 'a' in obj_schemas['uiSchema']:
                        prop_ui = {
                            "items": {
                                'items': obj_schemas['uiSchema']['a']
                            }
                        }
                    prop_toml = {
                        'indexed': True,
                        'items': {
                            'indexed': True
                        }
                    }
                else:
                    raise Exception(f'Invalid value of dim in {v=}')
            elif k == 'molecules':
                # TODO dont hardcode item type and ui for global.molecules, but use itemtype defined in haddock3
                # Use default value to determine type of items in array/list
                prop['items'] = {
                    "type": "string",
                    "format": "uri-reference"
                }
                prop['format'] = 'moleculefilepaths'
                prop_ui = {
                    'items': {
                         'ui:widget': 'file',
                         'ui:options': {
                             # Make comma seperated string, see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
                             'accept': ",".join(v['accept'])
                         }
                    }
                }
            elif k == 'top_cluster':
                # TODO dont hardcode item type for seletopclusts:top_cluster, but use items:type defined in haddock3
                prop['items'] = {
                    "type": "number"
                }
            else:
                raise ValueError(f"Don't know how to determine type of items of {v}")
        else:
            raise ValueError(f"Don't know what to do with {k}:{v}")
        properties[k] = prop
        if 'group' in v and v['group'] != '':
            prop_ui['ui:group'] = v['group']
        if prop_ui:
            uiSchema[k] = prop_ui
        if prop_toml:
            tomlSchema[k] = prop_toml
    schema = {
        "type": "object",
        "properties": properties,
        "required": required,
        "additionalProperties": False
    }
    return {
        "schema": schema,
        "uiSchema": uiSchema,
        "tomlSchema": tomlSchema,
    }

def filter_on_level(config, level):
    # Each higher level should include parameters from previous level
    valid_levels = set()
    for l in config_expert_levels:
        valid_levels.add(l)
        if l == level:
            break
    return {k: v for k, v in config.items() if v['explevel'] in valid_levels and not v['explevel'] == _hidden_level}

def process_module(module_name, category, level):
    logging.warning(f'Processing module: {module_name}')
    package = f'haddock.modules.{category}.{module_name}'
    module = importlib.import_module(package)
    cls = module.HaddockModule
    with open(module.DEFAULT_CONFIG) as f:
        config = load(f, Loader=Loader)

    config4level = filter_on_level(config, level)
    schemas = config2schema(config4level)
    # TODO add $schema and $id to schema
    return {
        "id": module_name,
        "category": category,
        "label": module.__doc__,
        "description": cls.__doc__,
        "schema": schemas['schema'],
        "uiSchema": schemas['uiSchema'],
        "tomlSchema": schemas['tomlSchema'],
    }

def process_category(category):
    package = f'haddock.modules.{category}'
    module = importlib.import_module(package)
    return {
        'name': category,
        'description': module.__doc__,
    }

def get_category_order():
    return importlib.import_module('haddock.modules').category_hierarchy


def process_global(level):
    package = 'haddock.modules'
    module = importlib.import_module(package)
    with open(module.modules_defaults_path) as f:
        optional_global_parameters = load(f, Loader=Loader)
    gmodule = importlib.import_module('haddock.gear.parameters')
    with open(gmodule.MANDATORY_YAML) as f:
        mandatory_parameters = load(f, Loader=Loader)
    config = mandatory_parameters | optional_global_parameters
    config4level = filter_on_level(config, level)

    schemas = config2schema(config4level)
    # TODO add $schema and $id to schema
    return {
        "schema": schemas['schema'],
        "uiSchema": schemas['uiSchema'],
        "tomlSchema": schemas['tomlSchema'],
    }

def process_level(level_fn: Path, level: str):
    category_list = get_category_order()
    categories = [process_category(c) for c in category_list]

    broken_modules = {
        'topocg', # Gives `AttributeError: module 'haddock.modules.topology.topocg' has no attribute 'HaddockModule'` error
    }
    nodes = [process_module(module, category, level) for module, category in modules_category.items() if module not in broken_modules]

    catalog = {
        "title": f"Haddock 3 on {level} level",
        "categories": categories,
        'global': process_global(level),
        "nodes": nodes,
        "examples": {
            'docking-protein-ligand': '/examples/docking-protein-ligand.zip' # TODO get from somewhere instead of hardcoding it here
        }
    }
    with level_fn.open('w') as f:
        dump(catalog, f, sort_keys=False)

def write_catalog_index(catalogs, file):
    with file.open('w') as f:
        json.dump(catalogs, f)
        logging.warning(f'Written {file}')

def main(argv=sys.argv[1:]):
    argparser = argparser_builder()
    args = argparser.parse_args(argv)
    args.out_dir.mkdir(parents=True, exist_ok=True)

    catalogs = []
    for level in config_expert_levels:
        level_fn = args.out_dir / f'haddock3.{level}.yaml'
        level_url = args.root_url / f'haddock3.{level}.yaml'
        catalogs.append([f'haddock3{level}', str(level_url)])
        process_level(level_fn, level)
        logging.warning(f'Written {level_fn}')

    write_catalog_index(catalogs, args.out_dir / 'index.json')


if __name__ == '__main__':
    sys.exit(main())
