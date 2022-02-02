#!/usr/bin/env python3
"""
Requires haddock3, fcc and pyyaml

Run with

```
util/generate_haddock3_catalog.py --level basic public/haddock3.basic.catalog.yaml
util/generate_haddock3_catalog.py --level expert public/haddock3.expert.catalog.yaml
```

TODO move script outside workflow-builder repo as this repo should be generic and not have any haddock specific scripts
"""

import argparse
import importlib
from math import isnan
import sys
from yaml import dump, load, Loader

from haddock.modules import modules_category

LEVELS = ('basic', 'expert')

def argparser_builder():
    parser = argparse.ArgumentParser()
    parser.add_argument('out', type=argparse.FileType('w', encoding='UTF-8'), default='-')
    parser.add_argument('--level', choices=LEVELS, default=LEVELS[0])
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
            schema_uiSchema = config2schema({k2:v2 for k2,v2 in v.items() if k2 != 'explevel'})
            prop = schema_uiSchema['schema']
            if schema_uiSchema['uiSchema']:
                prop_ui = {
                    k: schema_uiSchema['uiSchema']
                }
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
            if 'default' in v and v['default'] == '':
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
            if 'default' in v and v['default'] == '':
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
            if 'min' in v:
                prop['minItems'] = v['minitems']
            if 'max' in v:
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
        # elif isinstance(v, dict):
        #     prop = config2schema(v)
        else:
            raise ValueError(f"Don't know what to do with {k}:{v}")
        properties[k] = prop
        if prop_ui:
            uiSchema[k] = prop_ui
    schema = {
        "type": "object",
        "properties": properties,
        "required": required
    }
    return {
        "schema": schema,
        "uiSchema": uiSchema
    }

def filter_on_level(config, level):
    # Each higher level should include parameters from previous level
    valid_levels = set()
    for l in LEVELS:
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
# TODO in haddock3 this section is called general run parameters, we could rename global to general
REQUIRED_GLOBAL_PARAMETERS = {
    'molecules': {
        'type': 'list',
        'itemtype': 'file',
        'accept': '.pdb',
        'minitems': 1,
        'maxitems': 20,
        'title': 'Molecules',
        'group': '',
        'explevel': 'basic'
    },
    'run_dir': {
        'type': 'dir',
        'title': 'Run directory',
        'group': '',
        'explevel': 'basic'
    }
}

def main(argv=sys.argv[1:]):
    argparser = argparser_builder()
    args = argparser.parse_args(argv)

    # TODO order the categories by which category needs output from another. Now order is not reproducible
    categories = [process_category(c) for c in set(modules_category.values())]

    broken_modules = {
        'clustfcc',  # Gives `ModuleNotFoundError: No module named 'fcc.scripts'`` error
        'topocg', # Gives `AttributeError: module 'haddock.modules.topology.topocg' has no attribute 'HaddockModule'` error
    }
    nodes = [process_module(module, category, args.level) for module, category in modules_category.items() if module not in broken_modules]

    catalog = {
        "title": f"Haddock 3 {args.level}",
        "categories": categories,
        'global': process_global(args.level),
        # TODO in haddock3 nodes are called modules, we could rename it here
        "nodes": nodes,
        "examples": {
            'docking': '/examples/docking-protein-ligand.zip' # TODO get from somewhere instead of hardcoding it here
        }
    }
    dump(catalog, args.out, sort_keys=False)

if __name__ == '__main__':
    sys.exit(main())