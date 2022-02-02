
export const workflowFilename = 'workflow.cfg'

export const workflowArchiveFilename = 'workflow.zip'

export const catalogURLchoices = [
  ['haddock3basic', new URL('/haddock3.basic.catalog.yaml', import.meta.url).href],
  ['haddock3intermediate', new URL('/haddock3.intermediate.catalog.yaml', import.meta.url).href],
  ['haddock3guru', new URL('/haddock3.guru.catalog.yaml', import.meta.url).href]
]
