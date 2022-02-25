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
    * accept -> ui:options={accept}
    * choices -> enum
    * explevel -> each explevel gets generated into own catalog
    * group -> ui:group in ui schema

TODO move script outside workflow-builder repo as this repo should be generic and not have any haddock specific scripts
"""

import argparse
import importlib
import json
import logging
from math import isnan
from pathlib import Path
import sys
from yaml import dump, load, Loader

from haddock.modules import modules_category
from haddock import config_expert_levels

def argparser_builder():
    parser = argparse.ArgumentParser()
    parser.add_argument('--out_dir', type=Path, default='public/catalog')
    parser.add_argument('--root_url', type=Path, default='/catalog')
    return parser

def config2schema(config):
    """Translate haddock3 config file of a module to JSON schema"""
    properties = {}
    uiSchema = {}

    required = []
    for k, v in config.items():
        prop = {}
        prop_ui = {}
        if 'default' in v:
            prop["default"] = v['default']
        else:
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
                    k3:v3 for k3,v3 in v2.items() if k3 != 'group' and k3 != 'explevel'
                } for k2,v2 in v.items() if k2 != 'explevel'
            }
            schema_uiSchema = config2schema(config2)
            prop = schema_uiSchema['schema']
            prop_ui = { 'ui:field': 'collapsible'}
            if schema_uiSchema['uiSchema']:
                prop_ui.update(schema_uiSchema['uiSchema'])
            # molXX in topaa are not required
            required.pop()
        elif v['type'] == 'boolean':
            prop['type'] = "boolean"
        elif v['type'] in {'float', 'integer'}:
            prop['type'] = "number"
            if 'max' in v:
                prop['maximum'] = v['max']
            if 'min' in v:
                prop['minimum'] = v['min']
            if 'default' in v and isnan(v['default']):
                # TODO handle nan's more gracefully
                del prop['default']
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
                prop_ui["ui:options"] = { "accept": v['accept']}
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
        elif v['type'] == 'list':
            prop['type'] = "array"
            if 'minitems' in v:
                prop['minItems'] = v['minitems']
            if 'maxitems' in v:
                prop['maxItems'] = v['maxitems']
            if 'itemtype' in v:
                obj = {'a' : {'type': v['itemtype']}} # config2schema requires object
                if 'accept' in v:
                    obj['a']['accept'] = v['accept']
                schema_uiSchema = config2schema(obj)
                prop['items'] = schema_uiSchema['schema']['properties']['a']
                if schema_uiSchema['uiSchema'] and schema_uiSchema['uiSchema']['a']:
                    prop_ui = {
                        "items": schema_uiSchema['uiSchema']['a']
                    }
            elif 'items' in v:
                obj = {'a' : v['items']} # config2schema requires object
                schema_uiSchema = config2schema(obj)
                prop['items'] = schema_uiSchema['schema']['properties']['a']
                if schema_uiSchema['uiSchema'] and schema_uiSchema['uiSchema']['a']:
                    prop_ui = {
                        "items": schema_uiSchema['uiSchema']['a']
                    }
            elif len(v['default']) and (isinstance(v['default'][0], int) or isinstance(v['default'][0], float)):
                # Use default value to determine type of items in array/list
                prop['items'] = {
                    "type": "number"
                }
            else:
                # TODO dont fallback to number, for example seletopclusts:top_cluster
                prop['items'] = {
                    "type": "number"
                }
                # raise ValueError(f"Don't know how to determine type of items of {v}")
        else:
            raise ValueError(f"Don't know what to do with {k}:{v}")
        properties[k] = prop
        if 'group' in v and v['group'] != '':
            prop_ui['ui:group'] = v['group']
        if prop_ui:
            uiSchema[k] = prop_ui
    schema = {
        "type": "object",
        "properties": properties,
        "required": required,
        "additionalProperties": False
    }
    return {
        "schema": schema,
        "uiSchema": uiSchema
    }

def filter_on_level(config, level):
    # Each higher level should include parameters from previous level
    valid_levels = set()
    for l in config_expert_levels:
        valid_levels.add(l)
        if l == level:
            break
    return {k: v for k, v in config.items() if v['explevel'] in valid_levels}

def process_module(module_name, category, level):
    package = f'haddock.modules.{category}.{module_name}'
    module = importlib.import_module(package)
    cls = module.HaddockModule
    with open(module.DEFAULT_CONFIG) as f:
        config = load(f, Loader=Loader)

    config4level = filter_on_level(config, level)
    schema_uiSchema = config2schema(config4level)
    # TODO add $schema and $id to schema
    return {
        "id": module_name,
        "category": category,
        "label": module.__doc__,
        "description": cls.__doc__,
        "schema": schema_uiSchema['schema'],
        "uiSchema": schema_uiSchema['uiSchema']
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
    config = REQUIRED_GLOBAL_PARAMETERS | optional_global_parameters
    config4level = filter_on_level(config, level)

    schema_uiSchema = config2schema(config4level)
    # TODO add $schema and $id to schema
    return {
        "schema": schema_uiSchema['schema'],
        "uiSchema": schema_uiSchema['uiSchema']
    }


# TODO retrieve required global config from haddock3 code
REQUIRED_GLOBAL_PARAMETERS = {
    'molecules': {
        'type': 'list',
        'itemtype': 'file',
        'accept': '.pdb',
        'minitems': 1,
        'maxitems': 20,
        'title': 'Molecules',
        'group': '',
        'explevel': 'easy'
    },
    'run_dir': {
        'type': 'dir',
        'title': 'Run directory',
        'group': '',
        'explevel': 'easy'
    }
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