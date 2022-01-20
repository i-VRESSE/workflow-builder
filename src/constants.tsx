
export const workflowFilename = 'workflow.cfg'

export const workflowArchiveFilename = 'workflow.zip'

// TODO choices should be loaded from a yaml file
// so a workflow-builder distribution dir can be combined with a catalogy index and catalog item files to make an app.
export const catalogURLchoices = [
  ['haddock3basic', new URL('/haddock3.basic.catalog.yaml', import.meta.url).href],
  ['haddock3intermediate', new URL('/haddock3.intermediate.catalog.yaml', import.meta.url).href],
  ['haddock3guru', new URL('/haddock3.guru.catalog.yaml', import.meta.url).href]
]
