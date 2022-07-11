import { atom, DefaultValue, selector, SetterOrUpdater, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { JSONSchema7 } from 'json-schema'
import { UiSchema } from '@rjsf/core'
import { nanoid } from 'nanoid'

import { externalizeDataUrls, internalizeDataUrls } from './dataurls'
import { saveArchive } from './archive'
import { ICatalog, IWorkflowNode, IFiles, IParameters, ICatalogNode } from './types'
import { catalog2tomlSchemas, workflow2tomltext } from './toml'
import { dropUnusedFiles, loadWorkflowArchive, emptyParams, clearFiles } from './workflow'
import { removeItemAtIndex, replaceItemAtIndex, moveItem, removeAllItems } from './utils/array'
import { groupParameters, unGroupParameters } from './grouper'
import { pruneDefaults } from './pruner'
import { resolveMaxItemsFrom } from './resolveMaxItemsFrom'
import { addMoleculeValidation } from './molecule/addMoleculeValidation'

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
 * Get currently loaded catalog
 *
 * @returns catalog value
 */
export function useCatalog (): ICatalog {
  return useRecoilValue<ICatalog>(catalogState)
}

export function useSetCatalog (): SetterOrUpdater<ICatalog> {
  return useSetRecoilState<ICatalog>(catalogState)
}

const draggingCatalogNodeState = atom<string | number | null>({
  key: 'draggingCatalogNode',
  default: null
})

export function useDraggingCatalogNodeState (): [string | number | null, SetterOrUpdater<string | number | null>] {
  return useRecoilState(draggingCatalogNodeState)
}

const globalParametersState = atom<IParameters>({
  key: 'global',
  default: {}
})

const editingGlobalParametersState = atom<boolean>({
  key: 'editingGlobal',
  default: false
})

const workflowNodesState = atom<IWorkflowNode[]>({
  key: 'workflowNodes',
  default: []
})

const draggingWorkflowNodeState = atom<string | number | null>({
  key: 'draggingWorkflowNode',
  default: null
})

export function useDraggingWorkflowNodeState (): [string | number | null, SetterOrUpdater<string | number | null>] {
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
export const activeSubmitButtonState = atom<HTMLButtonElement | undefined>({
  key: 'activeSubmitButton',
  default: undefined
})

export function useSetActiveSubmitButton (): (instance: HTMLButtonElement | null) => void {
  return useSetRecoilState(activeSubmitButtonState) as (instance: HTMLButtonElement | null) => void
}

export function useActiveSubmitButton (): HTMLButtonElement | undefined {
  return useRecoilValue(activeSubmitButtonState)
}

export function useSelectNodeIndex (): number {
  return useRecoilValue(selectedNodeIndexState)
}

const filesState = atom<IFiles>({
  key: 'files',
  default: {}
})

function formData2parameters (formData: IParameters, newFiles: IFiles, schema: JSONSchema7, uiSchema: UiSchema): IParameters {
  const ungrouped = unGroupParameters(formData, uiSchema)
  const externalized = externalizeDataUrls(ungrouped, newFiles)
  const pruned = pruneDefaults(externalized, schema)
  return pruned
}

function parameters2formData (parameters: IParameters, files: IFiles, uiSchema: UiSchema): IParameters {
  const internalized = internalizeDataUrls(parameters, files)
  const grouped = groupParameters(internalized, uiSchema)
  return grouped
}

const globalFormDataState = selector<IParameters>({
  key: 'globalFormData',
  get: ({ get }) => {
    const parameters = get(globalParametersState)
    const files = get(filesState)
    const catalog = get(catalogState)
    const formData = parameters2formData(parameters, files, catalog.global.uiSchema)
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
    if (formData instanceof DefaultValue) {
      parameters = {}
    } else {
      parameters = formData2parameters(formData, newFiles, catalog.global.schema, catalog.global.uiSchema)
    }
    const nodes = get(workflowNodesState)
    const newUsedFiles = dropUnusedFiles(parameters, nodes, newFiles)
    set(globalParametersState, parameters)
    set(filesState, newUsedFiles)
  }
})

export function useGlobalFormData (): [IParameters, SetterOrUpdater<IParameters>] {
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
    const formData = parameters2formData(node.parameters, files, catalogNode.uiSchema)
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
    const files = get(filesState)
    const newFiles = { ...files }
    let parameters: IParameters
    if (formData instanceof DefaultValue) {
      parameters = {}
    } else {
      parameters = formData2parameters(formData, newFiles, catalogNode.schema, catalogNode.uiSchema)
    }
    const nodes = get(workflowNodesState)
    const selectedNodeIndex = get(selectedNodeIndexState)
    const newNode = { ...nodes[selectedNodeIndex], parameters }
    const newNodes = replaceItemAtIndex(nodes, selectedNodeIndex, newNode)
    const global = get(globalParametersState)
    const newUsedFiles = dropUnusedFiles(global, newNodes, newFiles)
    set(workflowNodesState, newNodes)
    set(filesState, newUsedFiles)
  }
})

export function useSelectedNodeFormData (): [IParameters | undefined, SetterOrUpdater<IParameters | undefined>] {
  return useRecoilState(selectedNodeFormDataState)
}

const selectedNodeFormSchemaState = selector<JSONSchema7 | undefined>({
  key: 'selectedNodeFormSchema',
  get: async ({ get }) => {
    const catalogNode = get(selectedCatalogNodeState)
    const globalParameters = get(globalParametersState)
    const catalog = get(catalogState)
    if (catalogNode === undefined || catalogNode.formSchema === undefined || catalogNode === undefined || catalog === undefined) {
      return undefined
    }
    const schemaWithMaxItems = resolveMaxItemsFrom(catalogNode.formSchema, globalParameters)
    const globalSchema = catalog.global.schema
    const files = get(filesState)
    const schemaWithMolInfo = await addMoleculeValidation(schemaWithMaxItems, globalParameters, globalSchema, files)
    return schemaWithMolInfo
  }
})

export function useSelectedNodeFormSchema (): JSONSchema7 | undefined {
  return useRecoilValue(selectedNodeFormSchemaState)
}

interface UseWorkflow {
  nodes: IWorkflowNode[]
  editingGlobal: boolean
  global: IParameters
  toggleGlobalEdit: () => void
  addNodeToWorkflow: (nodeId: string) => void
  addNodeToWorkflowAt: (nodeId: string, targetCode: string) => void
  loadWorkflowArchive: (archiveURL: string) => Promise<void>
  save: () => Promise<void>
  clear: () => void
  deleteNode: (nodeIndex: number) => void
  selectNode: (nodeIndex: number) => void
  clearNodeSelection: () => void
  moveNode: (sourceCode: string, targetCode: string) => void
}

export function useWorkflow (): UseWorkflow {
  const [nodes, setNodes] = useRecoilState(workflowNodesState)
  const [global, setGlobal] = useRecoilState(globalParametersState)
  const [editingGlobal, setEditingGlobal] = useRecoilState(editingGlobalParametersState)
  const [selectedNodeIndex, setSelectedNodeIndex] = useRecoilState(selectedNodeIndexState)
  const [files, setFiles] = useRecoilState(filesState)
  const catalog = useCatalog()

  return {
    nodes,
    editingGlobal,
    global,
    toggleGlobalEdit () {
      setEditingGlobal(!editingGlobal)
      setSelectedNodeIndex(-1)
    },
    addNodeToWorkflowAt (nodeType: string, targetId: string) {
      const targetIndex = nodes.findIndex((n) => n.id === targetId)
      setNodes((oldNodes) => {
        const newNodes = [...oldNodes, { type: nodeType, parameters: {}, id: nanoid() }]
        return moveItem(newNodes, newNodes.length - 1, targetIndex)
      })
      if (selectedNodeIndex === -1 && !editingGlobal) {
        setSelectedNodeIndex(targetIndex)
      }
    },
    addNodeToWorkflow (nodeType: string) {
      setNodes((oldNodes) => [...oldNodes, { type: nodeType, parameters: {}, id: nanoid() }])
      if (selectedNodeIndex === -1 && !editingGlobal) {
        setSelectedNodeIndex(nodes.length)
      }
    },
    selectNode: (nodeIndex: number) => {
      if (editingGlobal) {
        setEditingGlobal(false)
      }
      setSelectedNodeIndex(nodeIndex)
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
      const blankGlobals = emptyParams()
      const blankFiles = clearFiles()
      setNodes(blankNodes)
      setGlobal(blankGlobals)
      setFiles(blankFiles)
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
    moveNode (sourceCode: string, targetCode: string) {
      setSelectedNodeIndex(-1)
      setNodes((oldNodes) => {
        const oldIndex = oldNodes.findIndex((n) => n.id === sourceCode)
        const newIndex = oldNodes.findIndex((n) => n.id === targetCode)
        return moveItem(oldNodes, oldIndex, newIndex)
      })
    }
  }
}

export function useFiles (): IFiles {
  return useRecoilValue(filesState)
}

export function useText (): string {
  const { nodes, global } = useWorkflow()
  const catalog = useCatalog()
  return workflow2tomltext(nodes, global, catalog2tomlSchemas(catalog))
}
