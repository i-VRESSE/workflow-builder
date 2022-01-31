import { readArchive } from './archive'
import { globalParameterKeys } from './catalog'
import { parseWorkflow } from './toml'
import { ICatalog, IFiles, IWorkflow } from './types'
import { validateWorkflow, ValidationError } from './validate'

interface ILoadedworkflow extends IWorkflow {
  files: IFiles
}

export async function loadWorkflowArchive (archiveURL: string, catalog: ICatalog): Promise<ILoadedworkflow> {
  const { tomlstring, files } = await readArchive(archiveURL, catalog.nodes)
  const globalKeys = globalParameterKeys(catalog.global)
  const { nodes, global } = parseWorkflow(tomlstring, globalKeys)
  const errors = validateWorkflow({
    global,
    nodes
  }, {
    global: catalog.global,
    nodes: catalog.nodes
  })
  if (errors.length > 0) {
    throw new ValidationError('Invalid workflow loaded', errors)
  }
  return {
    global,
    nodes,
    files
  }
}
