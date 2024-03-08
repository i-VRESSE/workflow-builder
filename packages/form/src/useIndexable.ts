import { UiSchema,getUiOptions } from '@rjsf/utils'

export const useIndexable = (uiSchema: UiSchema): [boolean, (n: number) => string] => {
  const uiOptions = getUiOptions(uiSchema)
  const indexable = (
    uiOptions !== undefined &&
    'indexable' in uiOptions &&
    (
      (typeof uiOptions.indexable === 'boolean' && uiOptions.indexable) ||
      Array.isArray(uiOptions.indexable)
    )
  )
  if (indexable &&
    Array.isArray(uiOptions.indexable)) {
    const lookup: string[] = uiOptions.indexable
    return [indexable, (i: number) => i < lookup.length ? lookup[i] : `${i + 1}`]
  }
  return [indexable, (i: number) => `${i + 1}`]
}
