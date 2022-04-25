import { readArchive } from './archive'
import { globalParameterKeys } from './catalog'
import { parseWorkflow } from './toml'
import { ICatalog, IFiles, IParameters, IWorkflow, IWorkflowNode } from './types'
import { walk } from './utils/searchreplace'
import { validateWorkflow, ValidationError } from './validate'

interface ILoadedworkflow extends IWorkflow {
  files: IFiles
}

export async function loadWorkflowArchive (archiveURL: string, catalog: ICatalog): Promise<ILoadedworkflow> {
  const { tomlstring, files } = await readArchive(archiveURL, catalog.nodes)
  const globalKeys = globalParameterKeys(catalog.global)
  const tomlSchema4global = catalog.global.tomlSchema ?? {}
  const tomSchema4nodes = Object.fromEntries(catalog.nodes.map(
    n => [n.id, n.tomlSchema !== undefined ? n.tomlSchema : {}])
  )
  const { nodes, global } = parseWorkflow(
    tomlstring, globalKeys, tomlSchema4global, tomSchema4nodes
  )
  const errors = validateWorkflow(
    {
      global,
      nodes
    }, {
      global: catalog.global,
      nodes: catalog.nodes
    },
    files
  )
  if (errors.length > 0) {
    console.error(errors)
    throw new ValidationError('Invalid workflow loaded', errors)
  }
  return {
    global,
    nodes,
    files
  }
}

export function dropUnusedFiles (global: IParameters, nodes: IWorkflowNode[], files: IFiles): IFiles {
  const newFiles = { ...files }
  const parameters = [global, ...nodes.map(n => n.parameters)]
  // Find out which files are mentioned in parameters
  const filenamesInParameters: Set<string> = new Set()
  walk(
    parameters,
    (d: string) => d in newFiles,
    (d: string) => {
      filenamesInParameters.add(d)
      return d
    }
  )
  // Remove any files not mentioned in parameters
  const filenames = Object.keys(newFiles)
  for (const filename of filenames) {
    if (!filenamesInParameters.has(filename)) {
      // TODO convert files to Map get rid of eslint-disable
      /* eslint-disable @typescript-eslint/no-dynamic-delete */
      delete newFiles[filename]
    }
  }
  return newFiles
}

export function emptyParams (): IParameters {
  return {}
}

export function clearFiles (): IFiles {
  return {}
}
