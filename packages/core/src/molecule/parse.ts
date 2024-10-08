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
  /**
   * Error if any
   * If set the chains and residueSequenceNumbers should not be used
   */
  error?: unknown
}

// use init only once
// NOTE! when init is in parseDB function is causes undesired page reloads
// when using autosave function. It results in the layout shift and lost
// of focus on the input element user is editing.
init()
  .then(() => console.log('pdbtx...initialized'))
  .catch(e => console.error(e.message))

export function parsePDB (content: string): Omit<MoleculeInfo, 'path'> {
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
      residueSequenceNumbers: [],
      error
    }
  }
}
