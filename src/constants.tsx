
export const workflowFilename = 'workflow.cfg'

export const workflowArchiveFilename = 'workflow.zip'

export const catalogURLchoices = [
    ['default', new URL('/catalog.yaml', import.meta.url).href],
    ['haddock3basic', new URL('/haddock3basic.catalog.yaml', import.meta.url).href],
    ['test', new URL('/test.catalog.yaml', import.meta.url).href]
  ]
