import { init, open_pdb } from '@i-vresse/pdbtbx-ts'

export interface MoleculeInfo {
  chains: string[]
  residueSequenceNumbers: number[]
}

export async function parsePDB (content: string): Promise<MoleculeInfo> {
  // TODO do init only once
  await init()
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
