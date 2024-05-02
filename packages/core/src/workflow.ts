import { JSONSchema7 } from 'json-schema'
import { readArchive } from './archive'
import { parseWorkflow } from './toml'
import { ICatalog, IFiles, IParameters, IWorkflow, IWorkflowNode } from './types'
import { walk } from './utils/searchreplace'
import { validateWorkflow, ValidationError } from './validate'

export interface ILoadedworkflow extends IWorkflow {
  files: IFiles
}

export async function loadWorkflowArchive (archiveURL: string, catalog: ICatalog): Promise<ILoadedworkflow> {
  const { tomlstring, files } = await readArchive(archiveURL)
  const workflow = parseWorkflow(tomlstring, catalog)
  const errors = await validateWorkflow(workflow, catalog, files)
  if (errors.length > 0) {
    throw new ValidationError('Invalid workflow loaded', errors)
  }
  return {
    ...workflow,
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

export function emptyGlobalParams (schema: JSONSchema7): IParameters {
  const parameters: IParameters = {}
  for (const key in schema.properties) {
    const propSchema = schema.properties[key]
    if (typeof propSchema !== 'boolean' && propSchema.type === 'array') {
      parameters[key] = []
    }
  }
  return parameters
}

export function clearFiles (): IFiles {
  return {}
}
