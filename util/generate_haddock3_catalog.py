#!/usr/bin/env python3
"""
Requires haddock3, fcc and pyyaml

Run with

```
util/generate_haddock3_catalog.py --level basic public/haddock3.basic.catalog.yaml
util/generate_haddock3_catalog.py --level intermediate public/haddock3.intermediate.catalog.yaml
util/generate_haddock3_catalog.py --level guru public/haddock3.guru.catalog.yaml
```

TODO move script outside workflow-builder repo as this repo should be generic and not have any haddock specific scripts
"""

import argparse
import importlib
import sys
from yaml import dump, load, Loader

from haddock.modules import modules_category

LEVELS = ('basic', 'intermediate', 'guru')

def argparser_builder():
    parser = argparse.ArgumentParser()
    parser.add_argument('out', type=argparse.FileType('w', encoding='UTF-8'), default='-')
    parser.add_argument('--level', choices=LEVELS, default='basic')
    return parser

def config2schema(config):
    """Translate haddock3 config file of a module to JSON schema"""
    properties = {}
    for k, v in config.items():
        prop = {}
        if 'default' in v:
            prop["default"] = v['default']
        if 'hover' in v and v['hover'] != 'No help yet':
            prop['title'] = v['hover']
        if 'doc' in v and v['doc'] != 'No help yet':
            prop['description'] = v['doc']
        if 'type' not in v:
            # TODO handle mol1': {'prot_segid
            continue
        if v['type'] == 'bool':
            prop['type'] = "boolean"
        elif v['type'] in {'float', 'integer'}:
            prop['type'] = "number"
            if 'max' in v:
                prop['maximum'] = v['max']
            if 'min' in v:
                prop['minimum'] = v['min']
        elif v['type'] == 'path':
            prop['type'] = 'string'
            prop['format'] = 'data-url'
            if 'length' in v:
                prop['maxLength'] = v['length']
        elif v['type'] == 'string':
            prop['type'] = 'string'
            if 'length' in v:
                prop['maxLength'] = v['length']
        # elif isinstance(v, str):
        #     prop = {
        #         "type": "string",
        #         # TODO could be path to file which needs `format: data-url`
        #         "default": v
        #     }
        elif v['type'] == 'list':
            prop['type'] = "array"
            if 'min' in v:
                prop['minItems'] = v['min']
            if 'max' in v:
                prop['maxItems'] = v['max']
            if 'items' in v:
                obj = {'a' : v['items']} # config2schema requires object
                items = config2schema(obj)
                prop['items'] = items['properties']['a']
            elif len(v['default']) and (isinstance(v['default'][0], int) or isinstance(v['default'][0], float)):
                # Use default value to determine type of items in array/list
                prop['items'] = {
                    "type": "number"
                }
            else:
                raise ValueError(f"Don't know how to determine type of items of {v}")

        # elif isinstance(v, dict):
        #     prop = config2schema(v)
        else:
            raise ValueError(f"Don't know what to do with {v}")
        properties[k] = prop
    return {
        "type": "object",
        "properties": properties,
        "required": [] # TODO mark required props
    }

def process_module(module_name, category, level):
    package = f'haddock.modules.{category}.{module_name}'
    module = importlib.import_module(package)
    cls = module.HaddockModule
    with open(module.DEFAULT_CONFIG) as f:
        config = load(f, Loader=Loader)

    # Each higher level should include parameters from previous level
    config4level = {}
    for l in LEVELS:
        config4level.update(config[l])
        if l == level:
            break

    return {
        "id": module_name,
        "category": category,
        "label": module.__doc__,
        "description": cls.__doc__,
        "schema": config2schema(config4level),
        "uiSchema": {}, # TODO
        "tomSchema": {}, # TODO
    }

def process_category(category):
    package = f'haddock.modules.{category}'
    module = importlib.import_module(package)
    return {
        'name': category,
        'description': module.__doc__,
    }

# TODO retrieve global config in haddock3 code
GLOBAL_CONFIG = load("""
molecules:
    default: []
    type: list
    items:
        type: path
        accept: '.pdb'
    min: 2
    max: 10
    hover: Molecules
    doc: No help yet
""", Loader=Loader)

GLOBAL_NODE = {
    "schema": config2schema(GLOBAL_CONFIG),
    "uiSchema": {},
}

def main(argv=sys.argv[1:]):
    argparser = argparser_builder()
    args = argparser.parse_args(argv)

    # TODO order of categories by which category needs output from another
    categories = [process_category(c) for c in set(modules_category.values())]

    broken_modules = {'clustfcc', 'topocg'}
    nodes = [process_module(module, category, args.level) for module, category in modules_category.items() if module not in broken_modules]

    catalog = {
        "title": f"Haddock 3 {args.level}",
        "categories": categories,
        "nodes": nodes,
        "global": GLOBAL_NODE,
        "templates": {
            'docking': '/templates/docking.zip' # TODO get from somewhere instead of hardcoding it here
        }
    }
    dump(catalog, args.out)

if __name__ == '__main__':
    sys.exit(main())