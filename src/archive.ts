import {
  BlobWriter,
  Data64URIReader,
  TextReader,
  ZipWriter,
} from "@zip.js/zip.js";
import { saveAs } from "file-saver";
import { IStep, INode, IFiles } from "./types";
import { steps2tomltext } from "./toml";

async function createZip(
  steps: IStep[],
  nodes: INode[],
  files: IFiles,
  workflowFilename: string
) {
  const writer = new ZipWriter(new BlobWriter("application/zip"));

  // add data URL content to file in archive
  await Promise.all(
    Object.entries(files).map(([fn, dataURL]) =>
      writer.add(fn, new Data64URIReader(dataURL))
    )
  );
  const text = steps2tomltext(steps, nodes);
  await writer.add(workflowFilename, new TextReader(text));

  return await writer.close();
}

export async function saveArchive(
  steps: IStep[],
  nodes: INode[],
  files: IFiles,
  workflowFilename: string,
  archiveFilename: string
) {
  const zip: Blob = await createZip(steps, nodes, files, workflowFilename);
  saveAs(zip, archiveFilename);
}
