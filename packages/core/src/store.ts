/**
 * Methods to set and retrieve the global state.
 *
 * @module
 */

import {
  atom,
  DefaultValue,
  selector,
  SetterOrUpdater,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState
} from 'recoil'
import { JSONSchema7 } from 'json-schema'
import { UiSchema } from '@rjsf/core'
import { nanoid } from 'nanoid'

import { externalizeDataUrls, internalizeDataUrls } from './dataurls'
import { saveArchive } from './archive'
import {
  ICatalog,
  IWorkflowNode,
  IFiles,
  IParameters,
  ICatalogNode,
  NodeErrorsType
} from './types'
import { catalog2tomlSchemas, workflow2tomltext } from './toml'
import {
  dropUnusedFiles,
  loadWorkflowArchive,
  emptyGlobalParams,
  clearFiles
} from './workflow'
import {
  removeItemAtIndex,
  replaceItemAtIndex,
  moveItem,
  removeAllItems
} from './utils/array'
import { groupParameters, unGroupParameters } from './grouper'
import { pruneDefaults } from './pruner'
import { resolveMaxItemsFrom } from './resolveMaxItemsFrom'
import { addMoleculeUi, addMoleculeValidation, parseMolecules } from './molecule/addMoleculeValidation'
import { MoleculeInfo } from './molecule/parse'

const catalogState = atom<ICatalog>({
  key: 'catalog',
  default: {
    title: '',
    categories: [],
    global: {
      schema: {},
      uiSchema: {}
    },
    nodes: [],
    examples: {}
  }
})

/**
 * Hook to get currently loaded catalog
 *
 * @example
 * In React component retrieve current catalog with
 * ```ts
 * import { useCatalog } from '@i-vresse/wb-core/dist/store'
 *
 * function MyComponent() {
 *   const catalog = useCatalog()
 *   return <div>{catalog.title}</div>
 * }
 * ```
 *
 * @returns catalog value
 */
export function useCatalog (): ICatalog {
  return useRecoilValue<ICatalog>(catalogState)
}

/**
 * Hook to set current catalog
 */
export function useSetCatalog (): SetterOrUpdater<ICatalog> {
  return useSetRecoilState<ICatalog>(catalogState)
}

const draggingCatalogNodeState = atom<string | number | null>({
  key: 'draggingCatalogNode',
  default: null
})

/**
 * Hook to get and set which catalog node is currently being draggged.
 *
 * The dndkit package uses an identifier to know which component is being dragged into a dropzone.
 */
export function useDraggingCatalogNodeState (): [
  string | number | null,
  SetterOrUpdater<string | number | null>
] {
  return useRecoilState(draggingCatalogNodeState)
}

const globalParametersState = atom<IParameters>({
  key: 'global',
  default: {}
})

const editingGlobalParametersState = atom<boolean>({
  key: 'editingGlobal',
  default: true
})

const workflowNodesState = atom<IWorkflowNode[]>({
  key: 'workflowNodes',
  default: []
})

const draggingWorkflowNodeState = atom<string | number | null>({
  key: 'draggingWorkflowNode',
  default: null
})

/**
 * Hook to get and set which workflow node is currently being draggged.
 *
 * The dndkit package uses an identifier to know which component is being dragged into a dropzone.
 */
export function useDraggingWorkflowNodeState (): [
  string | number | null,
  SetterOrUpdater<string | number | null>
] {
  return useRecoilState(draggingWorkflowNodeState)
}

const selectedNodeIndexState = atom<number>({
  key: 'selectedNodeIndex',
  default: -1
})

// Keep reference to submit button inside a rjsf form, so the button can be activated outside the form
// See https://github.com/rjsf-team/react-jsonschema-form/issues/500#issuecomment-849051041
// The current approach of using a singleton to store the active submit button,
// makes it impossible to have multiple forms renderede at the same time
const activeSubmitButtonState = atom<HTMLButtonElement | undefined>({
  key: 'activeSubmitButton',
  default: undefined
})

/**
 * Hook to set the reference of the hidden submit button inside a form.
 *
 * To submit a rjsf form using a button which is outside the form, you need a reference to a button inside form.
 */
export function useSetActiveSubmitButton (): (
  instance: HTMLButtonElement | null
) => void {
  return useSetRecoilState(activeSubmitButtonState) as (
    instance: HTMLButtonElement | null
  ) => void
}

/**
 * Hook to get the reference of the hidden submit button inside a form.
 *
 * To submit a rjsf form using a button which is outside the form, you need a reference to a button inside form.
 */

export function useActiveSubmitButton (): HTMLButtonElement | undefined {
  return useRecoilValue(activeSubmitButtonState)
}

/**
 * Hook to retrieve currently selected node by its index
 */
export function useSelectNodeIndex (): number {
  return useRecoilValue(selectedNodeIndexState)
}

const filesState = atom<IFiles>({
  key: 'files',
  default: {}
})

function formData2parameters (
  formData: IParameters,
  newFiles: IFiles,
  schema: JSONSchema7,
  uiSchema: UiSchema
): IParameters {
  const ungrouped = unGroupParameters(formData, uiSchema)
  const externalized = externalizeDataUrls(ungrouped, newFiles)
  const pruned = pruneDefaults(externalized, schema)
  return pruned
}

function parameters2formData (
  parameters: IParameters,
  files: IFiles,
  uiSchema: UiSchema
): IParameters {
  const internalized = internalizeDataUrls(parameters, files)
  const grouped = groupParameters(internalized, uiSchema)
  return grouped
}

const globalFormDataState = selector<IParameters>({
  key: 'globalFormData',
  get: ({ get }) => {
    const files = get(filesState)
    const catalog = get(catalogState)
    let parameters = get(globalParametersState)

    if (Object.keys(parameters)?.length === 0 &&
      Object.keys(catalog?.global?.schema)?.length > 0) {
      // get initial values only if global schema is loaded
      // and parameters is empty object?s
      parameters = emptyGlobalParams(catalog.global.schema)
    }
    const formData = parameters2formData(
      parameters,
      files,
      catalog.global.uiSchema
    )
    return formData
  },
  set: ({ get, set }, formData) => {
    if (formData === undefined) {
      return
    }
    const files = get(filesState)
    const newFiles = { ...files }
    const catalog = get(catalogState)
    let parameters: IParameters
    // debugger
    if (formData instanceof DefaultValue) {
      // get default/inital state
      parameters = emptyGlobalParams(catalog.global.schema)
    } else {
      parameters = formData2parameters(
        formData,
        newFiles,
        catalog.global.schema,
        catalog.global.uiSchema
      )
    }
    const nodes = get(workflowNodesState)
    const newUsedFiles = dropUnusedFiles(parameters, nodes, newFiles)
    set(globalParametersState, parameters)
    set(filesState, newUsedFiles)
  }
})

/**
 * Hook to get and set global form data
 */
export function useGlobalFormData (): [
  IParameters,
  SetterOrUpdater<IParameters>
] {
  return useRecoilState(globalFormDataState)
}

const selectedNodeState = selector<IWorkflowNode | undefined>({
  key: 'selectedNode',
  get: ({ get }) => {
    const index = get(selectedNodeIndexState)
    const nodes = get(workflowNodesState)
    if (index in nodes) {
      return nodes[index]
    }
    return undefined
  }
})

/**
 * Hook to get currently selected node
 */
export function useSelectedNode (): IWorkflowNode | undefined {
  return useRecoilValue(selectedNodeState)
}

const selectedCatalogNodeState = selector<ICatalogNode | undefined>({
  key: 'selectedNodeCatalogState',
  get: ({ get }) => {
    const node = get(selectedNodeState)
    if (node === undefined) {
      return undefined
    }
    const catalog = get(catalogState)
    const catalogNode = catalog.nodes.find((n) => n.id === node.type)
    if (catalogNode === undefined) {
      return undefined
    }
    return catalogNode
  }
})

/**
 * Hook to get catalog node belonging to type of currently selected node
 */
export function useSelectedCatalogNode (): ICatalogNode | undefined {
  return useRecoilValue(selectedCatalogNodeState)
}

const selectedNodeFormDataState = selector<IParameters | undefined>({
  key: 'selectedNodeFormData',
  get: ({ get }) => {
    const node = get(selectedNodeState)
    if (node === undefined) {
      return undefined
    }
    const catalogNode = get(selectedCatalogNodeState)
    if (catalogNode === undefined) {
      return undefined
    }
    const files = get(filesState)
    const formData = parameters2formData(
      node.parameters,
      files,
      catalogNode.uiSchema
    )
    return formData
  },
  set: ({ set, get }, formData) => {
    if (formData === undefined) {
      return
    }
    const catalogNode = get(selectedCatalogNodeState)
    if (catalogNode === undefined) {
      return
    }
    let formErrors = []
    if (Object.hasOwn(formData, 'formErrors')) {
      // NOTE! 2024-04-11
      // extract form errors info from ajv validator
      formErrors = (formData as any)?.formErrors
      // remove hasErrors from formData because it is not part of "real" data
      delete (formData as any).formErrors
    }
    const files = get(filesState)
    const newFiles = { ...files }
    // debugger
    let parameters: IParameters
    if (formData instanceof DefaultValue) {
      parameters = {}
    } else {
      parameters = formData2parameters(
        formData,
        newFiles,
        catalogNode.schema,
        catalogNode.uiSchema
      )
    }
    const nodes = get(workflowNodesState)
    const errors = get(nodeErrors)
    const selectedNodeIndex = get(selectedNodeIndexState)
    const newNode = {
      ...nodes[selectedNodeIndex],
      parameters
    }
    const newNodes = replaceItemAtIndex(nodes, selectedNodeIndex, newNode)
    const global = get(globalParametersState)
    const newUsedFiles = dropUnusedFiles(global, newNodes, newFiles)
    set(workflowNodesState, newNodes)
    set(filesState, newUsedFiles)
    // save errors status of each node
    const newErrors = {
      ...errors,
      [newNode.id]: {
        hasErrors: formErrors?.length > 0,
        errors: formErrors
      }
    }
    set(nodeErrors, newErrors)
  }
})

/**
 * Hook to get and set form data of currently selected node
 */
export function useSelectedNodeFormData (): [
  IParameters | undefined,
  SetterOrUpdater<IParameters | undefined>
] {
  return useRecoilState(selectedNodeFormDataState)
}

const moleculeInfosState = selector<[MoleculeInfo[], string | undefined]>({
  key: 'moleculeInfos',
  // NOTE 2024-05-15! making get async causes page reload
  get: ({ get }) => {
    const catalog = get(catalogState)
    const globalSchema = catalog.global.schema
    const globalParameters = get(globalParametersState)
    const files = get(filesState)
    const moleculeInfo = parseMolecules(
      globalParameters,
      globalSchema,
      files
    )
    // debugger
    return moleculeInfo
  }
})

const selectedNodeFormSchemaState = selector<JSONSchema7 | undefined>({
  key: 'selectedNodeFormSchema',
  get: ({ get }) => {
    const catalogNode = get(selectedCatalogNodeState)
    const globalParameters = get(globalParametersState)
    const info = get(moleculeInfosState)
    const schemaWithMolInfo = enrichSchemaWithMolInfo(catalogNode, globalParameters, info)
    return schemaWithMolInfo
  }
})

function enrichSchemaWithMolInfo (catalogNode: ICatalogNode | undefined, globalParameters: IParameters, info: [MoleculeInfo[], string | undefined]): JSONSchema7 | undefined {
  if (
    catalogNode === undefined ||
    catalogNode.formSchema === undefined
  ) {
    return undefined
  }
  const schemaWithMaxItems = resolveMaxItemsFrom(
    catalogNode.formSchema,
    globalParameters
  )
  const [moleculeInfos, moleculesPropName] = info
  const schemaWithMolInfo = addMoleculeValidation(
    schemaWithMaxItems,
    moleculeInfos,
    moleculesPropName
  )
  return schemaWithMolInfo
}

function emptyNodeParams (catalog: ICatalog, globalParameters: IParameters, info: [MoleculeInfo[], string | undefined], nodeType: string): IParameters {
  const catalogNode = catalog.nodes.find((n) => n.id === nodeType)
  if (catalogNode === undefined) {
    return {}
  }
  const schemaWithMolInfo = enrichSchemaWithMolInfo(catalogNode, globalParameters, info)
  if (schemaWithMolInfo === undefined) {
    return emptyGlobalParams(catalogNode.schema)
  }
  return emptyGlobalParams(schemaWithMolInfo)
}

/**
 * Hook to get JSON schema for currently selected node that can be used in a rjsf form.
 */
export function useSelectedNodeFormSchema (): JSONSchema7 | undefined {
  return useRecoilValue(selectedNodeFormSchemaState)
}

function expandSingleCollapsibleField (uiSchema: UiSchema): UiSchema {
  const nrCollapsibles = Object.values(uiSchema).filter(
    (v) => v['ui:field'] === 'collapsible'
  ).length
  if (nrCollapsibles === 1) {
    const firstCollapsibleKey = Object.keys(uiSchema).find(
      (k) => uiSchema[k]['ui:field'] === 'collapsible'
    )
    if (firstCollapsibleKey !== undefined) {
      return {
        ...uiSchema,
        [firstCollapsibleKey]: {
          ...uiSchema[firstCollapsibleKey],
          'ui:collapsed': false
        }
      }
    }
  }
  return uiSchema
}

const selectedNodeFormUiSchemaState = selector<UiSchema | undefined>({
  key: 'selectedNodeFormUiSchema',
  get: ({ get }) => {
    const schema = get(selectedNodeFormSchemaState)
    const catalogNode = get(selectedCatalogNodeState)
    if (schema === undefined || catalogNode === undefined || catalogNode.formUiSchema === undefined) {
      return undefined
    }
    const [moleculeInfos, moleculesPropName] = get(moleculeInfosState)
    const uiSchemaWithMolInfo = addMoleculeUi(
      catalogNode.formUiSchema,
      schema,
      moleculeInfos,
      moleculesPropName
    )

    return expandSingleCollapsibleField(uiSchemaWithMolInfo)
  }
})

export function useSelectedNodeFormUiSchema (): UiSchema | undefined {
  return useRecoilValue(selectedNodeFormUiSchemaState)
}

/**
 * Data and methods returned by {@link useWorkflow}
 */
export interface UseWorkflow {
  nodes: IWorkflowNode[]
  /**
   * Whether the form for global parameters is open
   */
  editingGlobal: boolean
  global: IParameters
  setEditingGlobal: (editing: boolean) => void
  selectGlobalEdit: () => void
  /**
   * @param nodeType A {@link types!ICatalogNode.id | catalog node id}
   */
  addNodeToWorkflow: (nodeType: string) => void
  /**
   * @param nodeType A {@link types!ICatalogNode.id | catalog node id}
   * @param targetId A {@link types!IWorkflowNode.id | id of a workflow node } to place new node.
   */
  addNodeToWorkflowAt: (nodeType: string, targetId: string) => void
  /**
   * Load a workflow from an archive.
   *
   * @param archiveURL The URL can have blob or data scheme to workaround cross-origin problems.
   */
  loadWorkflowArchive: (archiveURL: string) => Promise<void>
  /**
   * Creates archive from workflow and make web browser save it to disk.
   */
  save: () => Promise<void>
  /**
   * Remove the workflow including its files.
   */
  clear: () => void
  /**
   * @param nodeIndex The index in {@link UseWorkflow.nodes}
   */
  deleteNode: (nodeIndex: number) => void
  /**
   * Select a node so its parameters are rendered in a form.
   *
   * @param nodeIndex The index in {@link UseWorkflow.nodes}
   */
  selectNode: (nodeIndex: number) => void
  /**
   * Closes the form for editing parameters of the selected node.
   */
  clearNodeSelection: () => void
  /**
   * @param sourceId A {@link types!IWorkflowNode.id | id of a workflow node } to move.
   * @param targetId A {@link types!IWorkflowNode.id | id of a workflow node } to place source node.
   */
  moveNode: (sourceId: string, targetId: string) => void
}

/**
 * Hook to retrieve and manipulate workflow
 */
export function useWorkflow (): UseWorkflow {
  // TODO split up into hooks with smaller api
  const [nodes, setNodes] = useRecoilState(workflowNodesState)
  const [global, setGlobal] = useRecoilState(globalParametersState)
  const [editingGlobal, setEditingGlobal] = useRecoilState(
    editingGlobalParametersState
  )
  const [selectedNodeIndex, setSelectedNodeIndex] = useRecoilState(
    selectedNodeIndexState
  )
  const [files, setFiles] = useRecoilState(filesState)
  const catalog = useCatalog()
  // clear errors method
  const { clearErrors } = useClearErrors()
  const moleculeInfos = useRecoilValue(moleculeInfosState)

  return {
    nodes,
    editingGlobal,
    global,
    setEditingGlobal,
    selectGlobalEdit () {
      setEditingGlobal(true)
      setSelectedNodeIndex(-1)
    },
    addNodeToWorkflowAt (nodeType: string, targetId: string) {
      const targetIndex = nodes.findIndex((n) => n.id === targetId)
      setNodes((oldNodes) => {
        const newNodes = [
          ...oldNodes,
          { type: nodeType, parameters: {}, id: nanoid() }
        ]
        return moveItem(newNodes, newNodes.length - 1, targetIndex)
      })
      // debugger
      setSelectedNodeIndex(targetIndex)
    },
    addNodeToWorkflow (nodeType: string) {
      const parameters = emptyNodeParams(catalog, global, moleculeInfos, nodeType)
      setNodes((oldNodes) => [
        ...oldNodes,
        { type: nodeType, parameters, id: nanoid() }
      ])
      setSelectedNodeIndex(nodes.length)
    },
    selectNode: (nodeIndex: number) => {
      setSelectedNodeIndex(nodeIndex)
      if (editingGlobal) {
        setEditingGlobal(false)
      }
    },
    deleteNode (nodeIndex: number) {
      if (selectedNodeIndex !== -1) {
        if (nodeIndex === selectedNodeIndex) {
          setSelectedNodeIndex(-1)
        } else if (nodeIndex < selectedNodeIndex) {
          setSelectedNodeIndex(selectedNodeIndex - 1)
        }
      }
      const newNodes = removeItemAtIndex(nodes, nodeIndex)
      const newFiles = dropUnusedFiles(global, newNodes, files)
      setFiles(newFiles)
      setNodes(newNodes)
    },
    clearNodeSelection: () => setSelectedNodeIndex(-1),
    clear () {
      const blankNodes = removeAllItems(nodes)
      const blankGlobals = emptyGlobalParams(catalog.global.schema)
      const blankFiles = clearFiles()
      setNodes(blankNodes)
      setGlobal(blankGlobals)
      setFiles(blankFiles)
      // preselect global
      setEditingGlobal(true)
      setSelectedNodeIndex(-1)
      // clear errors
      clearErrors()
    },
    async loadWorkflowArchive (archiveURL: string) {
      const r = await loadWorkflowArchive(archiveURL, catalog)
      setNodes(r.nodes)
      setFiles(r.files)
      setGlobal(r.global)
    },
    async save () {
      await saveArchive(nodes, global, files, catalog2tomlSchemas(catalog))
    },
    moveNode (sourceId: string, targetId: string) {
      setSelectedNodeIndex(-1)
      setNodes((oldNodes) => {
        const oldIndex = oldNodes.findIndex((n) => n.id === sourceId)
        const newIndex = oldNodes.findIndex((n) => n.id === targetId)
        return moveItem(oldNodes, oldIndex, newIndex)
      })
    }
  }
}

/**
 * Hook to get files of current workflow
 */
export function useFiles (): IFiles {
  return useRecoilValue(filesState)
}

/**
 * Hook to get text of workflow config file
 */
export function useText (): string {
  const { nodes, global } = useWorkflow()
  const catalog = useCatalog()
  return workflow2tomltext(nodes, global, catalog2tomlSchemas(catalog))
}

/**
 * Autosave state and hooks
 */
const autosave = atom<boolean>({
  key: 'autosave',
  default: true
})

export function useAutosave (): [boolean, SetterOrUpdater<boolean>] {
  return useRecoilState(autosave)
}

export function useSetAutosave (): SetterOrUpdater<boolean> {
  return useSetRecoilState(autosave)
}

export function useAutosaveValue (): boolean {
  return useRecoilValue(autosave)
}

const nodeErrors = atom<{
  [key: string]: NodeErrorsType
}>({
  key: 'nodeErrors',
  default: {}
})

export function useNodeHasErrors (): [{
  [key: string]: NodeErrorsType
}, SetterOrUpdater<{
  [key: string]: NodeErrorsType
}>] {
  return useRecoilState(nodeErrors)
}

export function useSetNodeErrors (): (key: string, value: NodeErrorsType) => void {
  const [errorNodes, setErrorNodes] = useNodeHasErrors()
  // return function to update single node state
  return function setNodeHasErrors (key: string, value: NodeErrorsType) {
    if (errorNodes[key] !== value) {
      const newValid = {
        ...errorNodes,
        [key]: value
      }
      setErrorNodes(newValid)
    }
  }
}

export function useNodeHasErrorsValue (key: string): boolean {
  const nodes = useRecoilValue(nodeErrors)

  if (Object.hasOwn(nodes, key)) {
    return nodes[key].hasErrors
  } else {
    return false
  }
}

export function useClearErrors (): {
  clearErrors: () => void
} {
  const setErrors = useSetRecoilState(nodeErrors)
  // set to empty object
  function clearErrors (): void {
    setErrors({})
  }
  return {
    clearErrors
  }
}

export function useWorkflowHasErrors (): boolean {
  const errors = useRecoilValue(nodeErrors)
  const keys = Object.keys(errors)

  // at least one node has error
  const errorKey = keys.find(key => {
    return errors[key]?.hasErrors
  })
  // if errorKey is found it has string type
  const hasErrors = typeof errorKey === 'string'

  return hasErrors
}

/**
 * Creates archive from workflow and make web browser save it to disk.
 *
 * With rewrite of global parameters as a callback.
 *
 * @param cb Rewrite global parameters
 */
export function useSaveWithGlobalRewrite (
  cb: (
    global: IParameters,
  ) => IParameters
): () => Promise<void> {
  const nodes = useRecoilValue(workflowNodesState)
  const global = useRecoilValue(globalParametersState)
  const files = useRecoilValue(filesState)
  const catalog = useRecoilValue(catalogState)
  return async () => {
    const rewrittenGlobal = cb(global)
    await saveArchive(nodes, rewrittenGlobal, files, catalog2tomlSchemas(catalog))
  }
}
