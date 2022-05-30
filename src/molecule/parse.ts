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
