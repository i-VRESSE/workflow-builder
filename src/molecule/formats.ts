import type Ajv from 'ajv'

const alwaysTrue = (): boolean => true

/**
 * Formats that can be used as value for the `format` keyword inside a JSON schema.
 */
export const moleculeFormats = {
  moleculefilepaths: alwaysTrue,
  residue: alwaysTrue,
  chain: alwaysTrue,
  segmentid: alwaysTrue
}

/**
 * Adds all molecule formats to an ajv instance
 */
export function addMoleculeFormats (ajv: Ajv): void {
  Object.entries(moleculeFormats).forEach(
    ([name, format]) => ajv.addFormat(name, format)
  )
}
