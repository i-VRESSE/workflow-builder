import papa from 'papaparse'

export function splitHeader (header: string): string[] {
  return papa.parse<string[]>(header, {
    delimiter: '.',
    quoteChar: "'"
  }).data[0]
}

export function mergeHeader (cols: string[]): string {
  const txt = papa.unparse([cols], {
    delimiter: '.',
    quoteChar: "'"
  })
  return txt
}
