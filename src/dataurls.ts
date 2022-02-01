import { IFiles, IParameters } from './types'
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
