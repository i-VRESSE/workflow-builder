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
3. Bootstrap 4 <- chosen because it is default in react-json-schema-form

## State management

1. hooks
2. redux
3. recoil <- chosen for its simplicity
4. mobx

## Lint

1. eslint
2. standard <- chosen for its simplicity, but dont agree with some of its rules like `explicit-function-return-type` and weak autofixer

## Lang

1. Typescript

## Unit test

1. ~Jest~ requires lots of fiddling
1. vitest, similar api as jest, wip
1. vite-jest, connects vite compiler machinery to jest, wip

## Code formatter

1. Prettier
2. Standard

## e2e test

1. cypress

## Toml io

See https://github.com/toml-lang/toml/wiki

1. @ltd/j-toml

## Archive

Bundle workflow file and data files into an archive file.

1. @zip.js/zip.js

Save to disk

1. file-saver
1. ~ https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API ~ not supported on Firefox

## PDB or ciff read

1. ngl/parser/pdb-parser http://nglviewer.org/ngl/api/class/src/parser/pdb-parser.js~PdbParser.html

## Workflow/dag/flowchart drawing

## Drag n drop

Drag step from catalog to workflow visualization
Should place nice with workflow viz library.

1. ~react-beautiful-dnd~ No longer activly maintained
2. react-dnd
3. ~react-dragula~ No longer activly maintained
4. react-draggable

## Desktop app

1. electron with https://www.electronforge.io/ or electron-builder
2. tauri, https://tauri.studio/en/

## File pointers

Workflow parameters can be URLs to files on local disk.

1. https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
2. https://developer.mozilla.org/en-US/docs/Web/API/File_and_Directory_Entries_API

## Code highlighter

1. react-syntax-highlighter with prismjs

## Data validation

1. ajv, to validate data against JSON schema
2. ~typebox, to validate data against Typescript type~ Wanted to use for validating catalog, but catalog contains JSON schema of itself, typebox does not handle this nesting

## Notifications

1. react-toastify
2. ~react-hot-toast~ not chosen because fewer users, however does seem to be more active currently

## Form generation

1. https://github.com/rjsf-team/react-jsonschema-form
2. ~https://jsonforms.io/~ no native file upload support

## Similar tools

1. https://github.com/rabix/composer
2. https://galaxyproject.org/learn/advanced-workflow/
