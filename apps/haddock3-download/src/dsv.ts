import { parse, unparse } from 'papaparse'

export function splitHeader (header: string): string[] {
  return parse<string[]>(header, {
    delimiter: '.',
    quoteChar: "'"
  }).data[0]
}

export function mergeHeader (cols: string[]): string {
  const txt = unparse([cols], {
    delimiter: '.',
    quoteChar: "'"
  })
  return txt
}
