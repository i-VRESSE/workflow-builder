import { UiSchema, utils } from '@rjsf/core'

export const useIndexable = (uiSchema: UiSchema): [boolean, (n: number) => string] => {
  const uiOptions = utils.getUiOptions(uiSchema)
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
    return [indexable, (i: number) => i < lookup.length ? lookup[i] : `${i}`]
  }
  return [indexable, (i: number) => `${i}`]
}
