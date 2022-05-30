import pdbtbx, { open_pdb } from '@i-vresse/pdbtbx-ts'

export interface MoleculeInfo {
  chains: string[]
  residueSequenceNumbers: number[]
}

export async function parsePDB (content: string): Promise<MoleculeInfo> {
  if (process.env.NODE_ENV === 'test') {
    // vitest is run in NodeJS so needs wasm file read from disk instead of fetch using url
    const { readFile } = await import('fs/promises')
    const wasmBuffer = await readFile('node_modules/@i-vresse/pdbtbx-ts/pdbtbx_ts_bg.wasm')
    await pdbtbx(wasmBuffer)
  } else {
    // To make vite aware of wasm file, it needs to passed to pdbtbx-ts default method.
    // TODO make prettier URL
    const mod = new URL('../../node_modules/@i-vresse/pdbtbx-ts/pdbtbx_ts_bg.wasm', import.meta.url)
    await pdbtbx(mod)
  }
  try {
    const info = open_pdb(content)
    if (info.warnings.length > 0) {
      console.info('Parsing PDB warnings: ', info.warnings)
    }
    return {
      chains: info.chains,
      residueSequenceNumbers: info.residue_sequence_numbers
    }
  } catch (error) {
    // If opening fails then fallback to nothing found
    console.error(error)
    return {
      chains: [],
      residueSequenceNumbers: []
    }
  }
}
