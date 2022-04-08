import type Ajv from 'ajv'

const alwaysTrue = (): boolean => true

/**
 * Formats that can be used as value for the `format` keyword inside a JSON schema.
 */
export const moleculeFormatValidators = {
  moleculefilepaths: alwaysTrue,
  residue: alwaysTrue,
  chain: alwaysTrue,
  segmentid: alwaysTrue
}

export const moleculeFormats = new Set(Object.keys(moleculeFormatValidators))

/**
 * Adds all molecule formats to an ajv instance
 */
export function addMoleculeFormats (ajv: Ajv): void {
  Object.entries(moleculeFormatValidators).forEach(
    ([name, format]) => ajv.addFormat(name, format)
  )
}
