import { init, open_pdb } from '@i-vresse/pdbtbx-ts'

export interface MoleculeInfo {
  /**
   * Path of PDB file
   */
  path: string
  /**
   * Chains found in PDB file
   */
  chains: string[]
  /**
   * Unique residue numbers found in PDB file
   */
  residueSequenceNumbers: number[]
}

export async function parsePDB (content: string): Promise<Omit<MoleculeInfo, 'path'>> {
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
