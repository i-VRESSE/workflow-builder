import { UiSchema } from '@rjsf/core'
import { JSONSchema7 } from 'json-schema'
import { beforeEach, describe, expect, it, beforeAll } from 'vitest'
import { init } from '@i-vresse/pdbtbx-ts'

import { JSONSchema7WithMaxItemsFrom } from '../resolveMaxItemsFrom'
import { IFiles, IParameters } from '../types'
import {
  addMoleculeUi,
  addMoleculeValidation,
  parseMolecules
} from './addMoleculeValidation'
import { MoleculeInfo } from './parse'

beforeAll(async () => {
  await init()
})

describe('parseMolecules()', () => {
  describe('given bad global schema or parameters', () => {
    const unchangedCases: Array<
    [string, JSONSchema7WithMaxItemsFrom, IParameters, IFiles]
    > = [
      ['schema without props', {}, {}, {}],
      [
        'schema without prop[format=moleculefilepaths]',
        {
          type: 'object',
          properties: {
            prop1: { type: 'array' }
          }
        },
        {},
        {}
      ],
      [
        'parameter without prop[format=moleculefilepaths]',
        {
          type: 'object',
          properties: {
            prop1: { type: 'array', format: 'moleculefilepaths' }
          }
        },
        {},
        {}
      ],
      [
        'parameter[format=moleculefilepaths] is no array',
        {
          type: 'object',
          properties: {
            prop1: { type: 'array', format: 'moleculefilepaths' }
          }
        },
        { prop1: 'foo' },
        {}
      ]
    ]
    it.each(unchangedCases)(
      'given %s should find zero files',
      (_description, globalSchema, globalParameters, files) => {
        const actual = parseMolecules(
          globalParameters,
          globalSchema,
          files
        )
        expect(actual).toEqual([[], undefined])
      }
    )
  })

  it('should not error on null or undefined values in molecules array', () => {
    // when undefined value passed in array
    const mockGlobalParameters = {
      molecules: [undefined] as any
    }
    const mockGlobalSchema: JSONSchema7 = {
      type: 'object',
      properties: {
        run_dir: {
          title: 'Run directory',
          description: 'Folder to store the HADDOCK3 run',
          $comment: 'The new folder that will be created to save the HADDOCK3 run',
          type: 'string',
          format: 'uri-reference'
        },
        molecules: {
          title: 'Input Molecules',
          description: 'The input molecules that will be used for docking.',
          $comment: 'Molecules must be provided in PDB format. These PDB files can be single molecules or ensembles using the MODEL/ENDMDL statements.',
          type: 'array',
          minItems: 1,
          maxItems: 20,
          items: {
            type: 'string',
            format: 'uri-reference'
          },
          format: 'moleculefilepaths'
        },
        preprocess: {
          default: false,
          title: 'Tries to correct input PDBs',
          description: 'If true, evaluates and tries to correct the input PDB before the workflow.',
          $comment: "HADDOCK3 checks and processes the input PDB files to ensure they all comply with HADDOCK3's requirements. These checks concerns, for example, residue numbering, compatibility of chain IDs, and many others. You can see all checks performs in the live issue https://github.com/haddocking/haddock3/issues/143. If set to false, no checks are performed and HADDOCK3 directly uses the original input PDBs.",
          type: 'boolean'
        },
        postprocess: {
          default: true,
          title: 'Executes haddock3-analyse on the CAPRI folders at the end of the run',
          description: 'If true, executes haddock3-analyse on the CAPRI folders at the end of the workflow',
          $comment: 'haddock3-analyse is a cli (see https://github.com/haddocking/haddock3/blob/main/src/haddock/clis/cli_analyse.py) used to plot the results of a HADDOCK3 workflow. If this option, this command is automatically executed at the end of the workflow (on the caprieval folders).',
          type: 'boolean'
        },
        cns_exec: {
          title: 'Path to the CNS executable',
          description: 'If not provided, HADDOCK3 will use the cns path configured during the installation.',
          $comment: 'CNS is a required component to run HADDOCK. Ideally it should have been configured during installation. If not you can specify with the cns_exec parameter its path.',
          type: 'string',
          format: 'uri-reference'
        },
        ncores: {
          default: 4,
          title: 'Number of CPU cores',
          description: 'Number of CPU cores to use for the CNS calculations. It is truncated to max available CPUs  minus 1.',
          $comment: 'Number of CPU cores to use for the CNS calculations. This will define the number of concurrent jobs being executed. Note that is truncated to the total number of available CPUs minus 1.',
          type: 'number',
          maximum: 500,
          minimum: 1
        },
        mode: {
          default: 'local',
          title: 'Mode of execution',
          description: 'Mode of execution of the jobs, either local or using a batch system.',
          $comment: 'Mode of execution of the jobs, either local or using a batch system. Currently slurm and torque are supported. For the batch mode the queue command must be specified in the queue parameter.',
          type: 'string',
          minLength: 0,
          maxLength: 20,
          enum: [
            'local',
            'batch'
          ]
        },
        batch_type: {
          default: 'slurm',
          title: 'Batch system',
          description: 'Type of batch system running on your server',
          $comment: 'Type of batch system running on your server. Only slurm and torque are supported at this time',
          type: 'string',
          minLength: 0,
          maxLength: 100,
          enum: [
            'slurm',
            'torque'
          ]
        },
        queue: {
          title: 'Queue name',
          description: 'Name of the batch queue to which jobs will be submitted',
          $comment: 'Name of the batch queue to which jobs will be submitted. If not defined the batch system default will be used.',
          type: 'string',
          minLength: 0,
          maxLength: 100
        },
        queue_limit: {
          default: 100,
          title: 'Number of jobs to submit to the batch system',
          description: 'Number of jobs to submit to the batch system',
          $comment: 'This parameter controls the number of jobs that will be submitted to the batch system. In combination with the concat parameter this allow to limit the load on the queueing system and also make sure jobs remain in the queue for some time (if concat > 1) to avoid high system loads on the batch system.',
          type: 'number',
          maximum: 9999,
          minimum: 1
        },
        concat: {
          default: 1,
          title: 'Number of models to produce per job.',
          description: 'Multiple models can be calculated within one job',
          $comment: 'This defines the number of models that will be generated within on job script. This allows to concatenate the generation of models into one script. In that way jobs might run longer in the batch system and reduce the load on the scheduler.',
          type: 'number',
          maximum: 9999,
          minimum: 1
        },
        clean: {
          default: true,
          title: 'Clean the module output files.',
          description: 'Clean the module if run succeeds by compressing or removing output files.',
          $comment: "When running haddock through the command-line, the 'clean' parameter will instruct the workflow to clean the output files of the module if the whole run succeeds. In this process, PDB and PSF files are compressed to gzip, with the extension `.gz`. While files with extension `.seed`, `.inp`, and `.out` files are archived, and the original files deleted. The time to perform a cleaning operation depends on the number of files in the folders and the size of the files. However, it should not represent a limit step in the workflow. For example, a rigidbody sampling 10,000 structures takes about 4 minutes in our servers. This operation uses as many cores as allowed by the user in the 'ncores' parameter. SSD disks will perform faster by definition. See also the 'haddock3-clean' and 'haddock3-unpack' command-line clients.",
          type: 'boolean'
        },
        offline: {
          default: false,
          title: 'Isolate haddock3 from internet.',
          description: 'Completely isolate the haddock3 run & results from internet.',
          $comment: 'For interactive plots, we are using the plotly library. It can be embedded as a link to the plotly.js library and fetched from the web, or directly copied on the html files AT THE COST OF ~3Mb per file. Setting this parameter to `true` will add the javascript library in generated files, therefore completely isolating haddock3 from any web call.',
          type: 'boolean'
        }
      },
      required: [
        'run_dir'
      ],
      additionalProperties: false
    }
    const mockFiles = {}

    // return empty array
    const actual1 = parseMolecules(
      mockGlobalParameters,
      mockGlobalSchema,
      mockFiles
    )
    expect(actual1).toEqual([[], 'molecules'])

    // when undefined value passed in array
    mockGlobalParameters.molecules = [null]

    const actual2 = parseMolecules(
      mockGlobalParameters,
      mockGlobalSchema,
      mockFiles
    )
    expect(actual2).toEqual([[], 'molecules'])
  })
})

describe('addMoleculeValidation()', () => {
  describe('given a molecule with chain A', () => {
    let moleculeInfos: MoleculeInfo[]
    let moleculesPropName: string | undefined

    beforeEach(() => {
      const globalParameters = {
        molecules: ['a.pdb']
      }
      const globalSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          molecules: {
            type: 'array',
            format: 'moleculefilepaths',
            items: {
              type: 'string'
            }
          }
        }
      }
      const body =
        'ATOM     32  N  AARG A  -3      11.281  86.699  94.383  0.50 35.88           N  '
      const file =
        'data:text/plain;name=a.pdb;base64,' +
        Buffer.from(body).toString('base64')
      const files = {
        'a.pdb': file
      };
      [moleculeInfos, moleculesPropName] = parseMolecules(
        globalParameters,
        globalSchema,
        files
      )
    })

    it('should return schema unchanged', () => {
      const itemsSchema: JSONSchema7 = {
        type: 'string'
      }
      const propSchema: JSONSchema7WithMaxItemsFrom = {
        type: 'array',
        items: itemsSchema
      }
      const schema: JSONSchema7 = {
        type: 'object',
        properties: {
          prop1: propSchema
        }
      }
      const actual = addMoleculeValidation(
        schema,
        moleculeInfos,
        moleculesPropName
      )
      expect(actual).toEqual(schema)
    })

    describe('in array of array of object with prop with format:chain', () => {
      it('should set enum to [A]', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                prop2: {
                  type: 'string',
                  format: 'chain'
                }
              }
            }
          }
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }
        const actual = addMoleculeValidation(
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedPropSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: [
            {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  prop2: {
                    type: 'string',
                    format: 'chain',
                    enum: ['A']
                  }
                }
              }
            }
          ]
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: expectedPropSchema
          }
        }
        expect(actual).toEqual(expected)
      })
    })

    describe('in array of array of object with prop with format:residue', () => {
      it('should set enum to [-3]', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                prop2: {
                  type: 'number',
                  format: 'residue'
                }
              }
            }
          }
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }
        const actual = addMoleculeValidation(
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedPropSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: [
            {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  prop2: {
                    type: 'number',
                    format: 'residue',
                    enum: [-3]
                  }
                }
              }
            }
          ]
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: expectedPropSchema
          }
        }
        expect(actual).toEqual(expected)
      })
    })

    // Test for topoaa mol prop
    describe('in array of object of array of scalar with format:residue', () => {
      it('should set enum to [-3]', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'object',
            properties: {
              prop2: {
                type: 'array',
                items: {
                  type: 'number',
                  format: 'residue'
                }
              },
              prop3: {
                type: 'string'
              }
            }
          }
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema,
            prop4: {
              type: 'boolean'
            }
          }
        }
        const actual = addMoleculeValidation(
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedPropSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: [
            {
              type: 'object',
              properties: {
                prop2: {
                  type: 'array',
                  items: {
                    type: 'number',
                    format: 'residue',
                    enum: [-3]
                  }
                },
                prop3: {
                  type: 'string'
                }
              }
            }
          ]
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: expectedPropSchema,
            prop4: {
              type: 'boolean'
            }
          }
        }
        expect(actual).toEqual(expected)
      })
    })

    describe('in grouped object of array of array of object with prop with format:residue', () => {
      it('should set enum to [-3]', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                prop2: {
                  type: 'number',
                  format: 'residue'
                }
              }
            }
          }
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            group1: {
              type: 'object',
              properties: {
                prop1: propSchema
              }
            }
          }
        }
        const actual = addMoleculeValidation(
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedPropSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: [
            {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  prop2: {
                    type: 'number',
                    format: 'residue',
                    enum: [-3]
                  }
                }
              }
            }
          ]
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            group1: {
              type: 'object',
              properties: {
                prop1: expectedPropSchema
              }
            }
          }
        }
        expect(actual).toEqual(expected)
      })
    })

    // TODO finish test when fixing molecule awareness of https://github.com/i-VRESSE/workflow-builder/issues/88
    describe.skip('object with maxPropertiesFrom and with prop names with format:chain', () => {
      it('should return formSchema unchanged', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'object',
          additionalProperties: {
            type: 'string'
          },
          propertyNames: {
            format: 'chain'
          },
          maxPropertiesFrom: 'molecules'
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }

        const actual = addMoleculeValidation(
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedPropSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'object',
          properties: {
            A: {
              type: 'string'
            }
          }
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: expectedPropSchema
          }
        }
        expect(actual).toEqual(expected)
      })
    })
  })

  describe('given 2 molecules with chain A and B respectivly', () => {
    let moleculeInfos: MoleculeInfo[]
    let moleculesPropName: string | undefined

    beforeEach(async () => {
      const globalParameters = {
        molecules: ['a.pdb', 'b.pdb']
      }
      const globalSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          molecules: {
            type: 'array',
            format: 'moleculefilepaths',
            items: {
              type: 'string'
            }
          }
        }
      }
      const bodyA =
        'ATOM     32  N  AARG A  -3      11.281  86.699  94.383  0.50 35.88           N  '
      const fileA =
        'data:text/plain;name=a.pdb;base64,' +
        Buffer.from(bodyA).toString('base64')
      const bodyB =
        'ATOM     32  N  AARG B  42      11.281  86.699  94.383  0.50 35.88           N  '
      const fileB =
        'data:text/plain;name=a.pdb;base64,' +
        Buffer.from(bodyB).toString('base64')
      const files = {
        'a.pdb': fileA,
        'b.pdb': fileB
      };
      [moleculeInfos, moleculesPropName] = await parseMolecules(
        globalParameters,
        globalSchema,
        files
      )
    })

    describe('given array of array of object with props with format:chain, format:residue and no format', () => {
      it('should make items an array and set enums', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                prop2: {
                  type: 'string',
                  format: 'chain'
                },
                prop3: {
                  type: 'number',
                  format: 'residue'
                },
                prop4: {
                  type: 'boolean'
                }
              }
            }
          }
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }
        const actual = addMoleculeValidation(
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedPropSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: [
            {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  prop2: {
                    type: 'string',
                    format: 'chain',
                    enum: ['A']
                  },
                  prop3: {
                    type: 'number',
                    format: 'residue',
                    enum: [-3]
                  },
                  prop4: {
                    type: 'boolean'
                  }
                }
              }
            },
            {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  prop2: {
                    type: 'string',
                    format: 'chain',
                    enum: ['B']
                  },
                  prop3: {
                    type: 'number',
                    format: 'residue',
                    enum: [42]
                  },
                  prop4: {
                    type: 'boolean'
                  }
                }
              }
            }
          ]
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: expectedPropSchema
          }
        }
        expect(actual).toEqual(expected)
      })
    })
  })

  describe('given unparsable molecule', () => {
    let moleculeInfos: MoleculeInfo[]
    let moleculesPropName: string | undefined

    beforeEach(() => {
      const globalParameters = {
        // ensure unique name due to local cache
        molecules: ['xyz.pdb']
      }
      const globalSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          molecules: {
            type: 'array',
            format: 'moleculefilepaths',
            items: {
              type: 'string'
            }
          }
        }
      }
      const body = 'foo'
      const file =
        'data:text/plain;name=a.pdb;base64,' +
        Buffer.from(body).toString('base64')
      const files = {
        // ensure unique name due to local cache
        'xyz.pdb': file
      };
      [moleculeInfos, moleculesPropName] = parseMolecules(
        globalParameters,
        globalSchema,
        files
      )
    })

    describe('given array of object with array of scalar', () => {
      it.each([
        ['residue', 'number'],
        ['chain', 'string']
      ] as const)('should make items an array and not set enums for %s format', (moleculeformat, moleculeType) => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'object',
            properties: {
              prop2: {
                type: 'array',
                items: {
                  type: moleculeType,
                  format: moleculeformat
                }
              }
            }
          }
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }
        const actual = addMoleculeValidation(
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedPropSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: [
            {
              type: 'object',
              properties: {
                prop2: {
                  type: 'array',
                  items: {
                    type: moleculeType,
                    format: moleculeformat
                  }
                }
              }
            }
          ]
        }
        const expected: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: expectedPropSchema
          }
        }
        expect(actual).toEqual(expected)
      })
    })
  })
})

describe('addMoleculeUi()', () => {
  describe('given a molecule with chain A', () => {
    let moleculeInfos: MoleculeInfo[]
    let moleculesPropName: string | undefined
    beforeEach(async () => {
      const globalParameters = {
        molecules: ['a.pdb']
      }
      const globalSchema: JSONSchema7 = {
        type: 'object',
        properties: {
          molecules: {
            type: 'array',
            format: 'moleculefilepaths',
            items: {
              type: 'string'
            }
          }
        }
      }
      const body =
        'ATOM     32  N  AARG A  -3      11.281  86.699  94.383  0.50 35.88           N  '
      const file =
        'data:text/plain;name=a.pdb;base64,' +
        Buffer.from(body).toString('base64')
      const files = {
        'a.pdb': file
      };
      [moleculeInfos, moleculesPropName] = await parseMolecules(
        globalParameters,
        globalSchema,
        files
      )
    })
    describe('given array of string with ui:indexable', () => {
      it('should put filenames of pdb as indexable value', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'string'
          }
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }
        const uiSchema = {
          prop1: {
            'ui:indexable': true
          }
        }
        const formUiSchema = addMoleculeUi(
          uiSchema,
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedUiSchema = {
          prop1: {
            'ui:options': {
              indexable: ['a.pdb']
            }
          }
        }
        expect(formUiSchema).toEqual(expectedUiSchema)
      })
    })

    describe('given object with array of string with ui:indexable', () => {
      it('should put filenames of pdb as indexable value', () => {
        const propSchema: JSONSchema7WithMaxItemsFrom = {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'string'
          }
        }
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            group1: {
              type: 'object',
              properties: {
                prop1: propSchema
              }
            }
          }
        }
        const uiSchema = {
          group1: {
            prop1: {
              'ui:indexable': true
            }
          }
        }
        const formUiSchema = addMoleculeUi(
          uiSchema,
          schema,
          moleculeInfos,
          moleculesPropName
        )
        const expectedUiSchema = {
          group1: {
            prop1: {
              'ui:options': {
                indexable: ['a.pdb']
              }
            }
          }
        }
        expect(formUiSchema).toEqual(expectedUiSchema)
      })
    })

    const unchangedCases: Array<
    [string, JSONSchema7WithMaxItemsFrom, UiSchema]
    > = [
      [
        'no ui:indexable',
        {
          type: 'array',
          maxItemsFrom: 'molecules',
          items: {
            type: 'string'
          }
        },
        {}
      ],
      [
        'no maxItemsFrom',
        {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        {
          prop1: {
            'ui:indexable': true
          }
        }
      ],
      [
        'maxItemsFrom!=molecules',
        {
          type: 'array',
          maxItemsFrom: 'pdfs',
          items: {
            type: 'string'
          }
        },
        {
          prop1: {
            'ui:indexable': true
          }
        }
      ]
    ]
    it.each(unchangedCases)(
      'given %s should return uiSchema unchanged',
      (_description, propSchema, uiSchema) => {
        const schema: JSONSchema7 = {
          type: 'object',
          properties: {
            prop1: propSchema
          }
        }
        const formUiSchema = addMoleculeUi(
          uiSchema,
          schema,
          moleculeInfos,
          moleculesPropName
        )
        expect(formUiSchema).toEqual(uiSchema)
      }
    )
  })

  it('should return uiSchema unchanged when there are no molecules', () => {
    const propSchema: JSONSchema7WithMaxItemsFrom = {
      type: 'array',
      maxItemsFrom: 'molecules',
      items: {
        type: 'string'
      }
    }
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        prop1: propSchema
      }
    }
    const uiSchema = {
      prop1: {
        'ui:indexable': true
      }
    }
    const formUiSchema = addMoleculeUi(uiSchema, schema, [], undefined)
    expect(formUiSchema).toEqual(uiSchema)
  })
})
