# Stack

The first builder iteration should have following UI elements
* Read node definition from file
* List of available nodes
* Drag nodes to a canvas and connect them as a workflow
* Configure each node with parameters
* Output a workflow file

The software stack should produce app which:
* can run as static website or as a desktop app
* can be embedded within a bigger app (vre)
* can be developed on Windows/Mac/Linux
* uses mature/stable dependencies

## Component framework

1. React

## Build system

1. ~CRA~ too slow
2. Vite

## UI

Use desktop oriented framework

1. ant.design
2. blueprint
3. Bootstrap 4

## State management

1. hooks
2. redux
3. recoil
4. mobx

## Lint

1. eslint

## Lang

1. Typescript

## Unit test

1. Jest

## e2e test

1. cypress

## Toml io

See https://github.com/toml-lang/toml/wiki

1. @ltd/j-toml

## PDB or ciff read

1. ngl/parser/pdb-parser http://nglviewer.org/ngl/api/class/src/parser/pdb-parser.js~PdbParser.html

## Workflow/dag/flowchart drawing

## Drag n drop

Drag step from catalog to workflow visualization
Should place nice with workflow viz library.

1. react-beautiful-dnd
2. react-dnd

## Desktop app

1. electron with https://www.electronforge.io/ or electron-builder
2. tauri, https://tauri.studio/en/

## File pointers

Workflow parameters can be URLs to files on local disk.

1. https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
2. https://developer.mozilla.org/en-US/docs/Web/API/File_and_Directory_Entries_API

## Code highlighter

1. react-syntax-highlighter with prismjs

## Similar tools

1. https://github.com/rabix/composer
2. https://galaxyproject.org/learn/advanced-workflow/
