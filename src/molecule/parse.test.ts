import { describe, expect, it } from 'vitest'
import dedent from 'ts-dedent'
import { parsePDB, MoleculeInfo } from './parse'

describe('parsePDB', () => {
  const cases: Array<[string, string, MoleculeInfo]> = [
    [
      'given empty file should return zero chains and zero residues',
      '',
      {
        chains: [],
        residueSequenceNumbers: []
      }
    ],
    [
      'given single atom should return single chain and residue',
      'ATOM     32  N  AARG A  -3      11.281  86.699  94.383  0.50 35.88           N  ',
      {
        chains: ['A'],
        residueSequenceNumbers: [-3]
      }
    ],
    [
      'given 2 atom belonging to same chain should return single chain and 2 residues',
      dedent`
          ATOM     32  N  AARG A  -3      11.281  86.699  94.383  0.50 35.88           N
          ATOM    107  N   GLY A  13      12.681  37.302 -25.211 1.000 15.56           N`,
      {
        chains: ['A'],
        residueSequenceNumbers: [-3, 13]
      }
    ],
    [
      'given 2 atom belonging to same residue should return single chain and single residue',
      dedent`
          ATOM     32  N  AARG A  -3      11.281  86.699  94.383  0.50 35.88           N
          ATOM     33  N  BARG A  -3      11.296  86.721  94.521  0.50 35.60           N`,
      {
        chains: ['A'],
        residueSequenceNumbers: [-3]
      }
    ],
    [
      'given 2 atoms should return their chains and residues',
      dedent`
        ATOM     32  N  AARG A  -3      11.281  86.699  94.383  0.50 35.88           N
        ATOM   1185  O   LEU B  75      26.292  -4.310  16.940  1.00 55.45           O  `,
      {
        chains: ['A', 'B'],
        residueSequenceNumbers: [-3, 75]
      }
    ],
    [
      'given only hetatom shoulds return their chains and residues',
      dedent`
        HETATM    1  C1  G39 B 500     -30.374 -53.143   6.122  1.00 31.18      B    C
        HETATM    2  O1A G39 B 500     -31.439 -52.533   5.850  1.00 30.30      B    O
      `,
      {
        chains: ['B'],
        residueSequenceNumbers: [500]
      }
    ],
    [
      'given atoms and hetatom should return their chains and residues',
      dedent`
        ATOM     32  N  AARG A  -3      11.281  86.699  94.383  0.50 35.88           N
        HETATM    1  C1  G39 B 500     -30.374 -53.143   6.122  1.00 31.18      B    C
      `,
      {
        chains: ['A', 'B'],
        residueSequenceNumbers: [-3, 500]
      }
    ]
  ]
  it.each(cases)('%s', async (_description, input, expected) => {
    const actual = await parsePDB(input)
    expect(actual).toStrictEqual(expected)
  })
})
