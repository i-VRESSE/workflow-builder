import {
  BlobReader,
  BlobWriter,
  Data64URIReader,
  Data64URIWriter,
  TextReader,
  TextWriter,
  ZipReader,
  ZipWriter
} from '@zip.js/zip.js'
import { saveAs } from 'file-saver'
import { IStep, INode, IFiles, IParameters } from './types'
import { workflow2tomltext } from './toml'
import { workflowArchiveFilename, workflowFilename } from './constants'

async function createZip (
  steps: IStep[],
  global: IParameters,
  files: IFiles
) {
  const writer = new ZipWriter(new BlobWriter('application/zip'))

  // add data URL content to file in archive
  await Promise.all(
    Object.entries(files).map(async ([fn, dataURL]) =>
      await writer.add(fn, new Data64URIReader(dataURL))
    )
  )
  const text = workflow2tomltext(steps, global)
  await writer.add(workflowFilename, new TextReader(text))

  return await writer.close()
}

export async function saveArchive (
  steps: IStep[],
  global: IParameters,
  files: IFiles
) {
  const zip: Blob = await createZip(steps, global, files)
  saveAs(zip, workflowArchiveFilename)
}

export async function readArchive (archiveURL: string, nodes: INode[]): Promise<{
  tomlstring: string
  files: IFiles
}> {
  const url = new URL(archiveURL, import.meta.url).href
  const response = await fetch(url)
  const file = await response.blob()
  const reader = new ZipReader(new BlobReader(file))
  const entries = await reader.getEntries()
  const writer = new Data64URIWriter()
  const files: IFiles = {}
  let tomlstring = ''
  for await (const entry of entries) {
    if (entry.getData == null) {
      continue
    }
    if (entry.filename === workflowFilename) {
      tomlstring = await entry.getData(new TextWriter())
    } else {
      files[entry.filename] = await entry.getData(writer)
    }
  }
  return {
    tomlstring,
    files
  }
}
