// import type Ajv from 'ajv'

/*
 * A molecule format can not be validated by its own, it needs context.
 * To validate the format additional rules are added dynamicly to the schema like enum or maxItems.
 * This means the format itself is always valid.
 */
const alwaysTrue = (): boolean => true

/**
 * Formats that can be used as value for the `format` keyword inside a JSON schema.
 */
export const moleculeFormatValidators = {
  moleculefilepaths: alwaysTrue,
  residue: alwaysTrue,
  chain: alwaysTrue
}

export const moleculeFormats = new Set(Object.keys(moleculeFormatValidators))

/**
 * Adds all molecule formats to an ajv instance
 */
export function addMoleculeFormats (ajv: any): void {
  Object.entries(moleculeFormatValidators).forEach(
    ([name, format]) => ajv.addFormat(name, format)
  )
}
