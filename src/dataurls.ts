import { IFiles, IParameters, IWorkflowNode } from './types'
import { walk } from './utils/searchreplace'

export function isDataURL (value: string): boolean {
  return value.startsWith('data:')
}

export function dataURL2filename (value: string): string {
  // rjsf creates data URLs like `data:text/markdown;name=README.md;base64,Rm9.....`
  return value.split(';')[1].split('=')[1]
}

export function externalizeDataUrls (data: IParameters, files: IFiles): IParameters {
  return walk(data, isDataURL, (d: string) => {
    const fn = dataURL2filename(d)
    files[fn] = d
    return fn
  })
}

export function internalizeDataUrls (data: IParameters, files: IFiles): IParameters {
  return walk(
    data,
    (d: string) => d in files,
    (d: string) => files[d]
  )
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
