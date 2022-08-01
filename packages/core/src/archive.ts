/**
 * Methods to read and write workflow archive file.
 *
 * @module
 */

import {
  BlobReader,
  BlobWriter,
  Data64URIReader,
  Data64URIWriter,
  getMimeType,
  TextReader,
  TextWriter,
  ZipReader,
  ZipWriter
} from '@zip.js/zip.js'
import { saveAs } from 'file-saver'
import { IWorkflowNode, IFiles, IParameters } from './types'
import { TomlSchemas, workflow2tomltext } from './toml'
import { workflowArchiveFilename, workflowFilename } from './constants'

export async function createZip (
  nodes: IWorkflowNode[],
  global: IParameters,
  files: IFiles,
  tomlSchemas: TomlSchemas
): Promise<Blob> {
  const writer = new ZipWriter(new BlobWriter('application/zip'))

  // add data URL content to file in archive
  await Promise.all(
    Object.entries(files).map(async ([fn, dataURL]) =>
      await writer.add(fn, new Data64URIReader(dataURL))
    )
  )
  const text = workflow2tomltext(nodes, global, tomlSchemas)
  await writer.add(workflowFilename, new TextReader(text))

  return await writer.close()
}

/**
 * Save workflow archive.
 *
 * @remarks
 * Can only be used in web-browsers. Use low level {@link createZip} to create an workflow archive on non-web browsers.
 */
export async function saveArchive (
  nodes: IWorkflowNode[],
  global: IParameters,
  files: IFiles,
  tomlSchemas: TomlSchemas
): Promise<void> {
  const zip: Blob = await createZip(nodes, global, files, tomlSchemas)
  saveAs(zip, workflowArchiveFilename)
}

function injectFilenameIntoDataURL (filename: string, unnamedDataURL: string): string {
  const mimeType = getMimeType(filename)
  return unnamedDataURL.replace('data:;base64,', `data:${mimeType};name=${filename};base64,`)
}

/**
 * Read an workflow archive
 *
 * The content of the file called `workflow.cfg` ({@link constants!workflowFilename}) is returned as tomlsting.
 *
 * All files in archved not named `workflow.cfg` ({@link constants!workflowFilename}) are returned in files object.
 *
 * @param archiveURL URL of archive. Must be fetch()-able.
 */
export async function readArchive (archiveURL: string): Promise<{
  tomlstring: string
  files: IFiles
}> {
  const url = new URL(archiveURL, import.meta.url).href
  const response = await fetch(url)
  const file = await response.blob()
  const reader = new ZipReader(new BlobReader(file))
  const entries = await reader.getEntries()
  // TODO store files as File object (https://developer.mozilla.org/en-US/docs/Web/API/File),
  // File object contains filename property while filename is hacked into dataURL so rjsf can use it
  // Also File object together with URL.createObjectURL() could be more performant then copying large dataURL strings around
  const files: IFiles = {}
  let tomlstring = ''
  for await (const entry of entries) {
    if (entry.getData == null) {
      continue
    }
    if (entry.filename === workflowFilename) {
      tomlstring = await entry.getData(new TextWriter())
    } else if (entry.directory) {
      // Skip directories
    } else {
      const writer = new Data64URIWriter()
      const dataURL = await entry.getData(writer)
      files[entry.filename] = injectFilenameIntoDataURL(entry.filename, dataURL)
    }
  }
  if (tomlstring === '') {
    throw new Error('No workflow.cfg file found in workflow archive file')
  }
  return {
    tomlstring,
    files
  }
}
