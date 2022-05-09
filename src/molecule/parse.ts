import pdbtbx, { open_pdb } from '@i-vresse/pdbtbx-ts'

export interface MoleculeInfo {
  chains: string[]
  residueSequenceNumbers: number[]
}

export function parsePDB (content: string): MoleculeInfo {
  // Code partially inspired by https://github.com/justinmc/parse-pdb/blob/master/index.js
  const pdbLines = content.split('\n')
  const chains = new Set<string>()
  const residueSequenceNumbers = new Set<number>()
  pdbLines
    .filter(l => l.startsWith('ATOM  '))
    .forEach((l) => {
      // Use ATOM record format v3.3, see http://www.wwpdb.org/documentation/file-format-content/format33/sect9.html#ATOM
      const chainID = l.substring(21, 22).trim()
      chains.add(chainID)
      const resSeq = parseInt(l.substring(22, 26))
      residueSequenceNumbers.add(resSeq)
    })
  pdbLines
    .filter(l => l.startsWith('HETATM'))
    .forEach((l) => {
      // Use HETATM record format v3.3, see http://www.wwpdb.org/documentation/file-format-content/format33/sect9.html#HETATM
      const chainID = l.substring(21, 22).trim()
      chains.add(chainID)
      const resSeq = parseInt(l.substring(22, 26))
      residueSequenceNumbers.add(resSeq)
    })
  return {
    chains: Array.from(chains),
    residueSequenceNumbers: Array.from(residueSequenceNumbers)
  }
}

export async function parsePDB2 (content: string): Promise<MoleculeInfo> {
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
    console.info(info.warnings)
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
