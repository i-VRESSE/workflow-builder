import { atom, DefaultValue, selector, SetterOrUpdater, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import { externalizeDataUrls, internalizeDataUrls } from './dataurls'
import { saveArchive } from './archive'
import { ICatalog, IWorkflowNode, IFiles, IParameters, ICatalogNode, ICatalogIndex } from './types'
import { workflow2tomltext } from './toml'
import { dropUnusedFiles, loadWorkflowArchive, emptyParams, clearFiles } from './workflow'
import { fetchCatalogIndex, fetchCatalog } from './catalog'
import { catalogIndexURL } from './constants'
import { removeItemAtIndex, replaceItemAtIndex, moveItem, removeAllItems } from './utils/array'
import { groupParameters, unGroupParameters } from './grouper'

const catalogIndexState = selector<ICatalogIndex>({
  key: 'catalogIndex',
  get: async () => {
    return await fetchCatalogIndex(catalogIndexURL)
  }
})

export function useCatalogIndex (): ICatalogIndex {
  return useRecoilValue(catalogIndexState)
}

const defaultCatalogURLState = selector<string>({
  key: 'defaultCatalogURL',
  get: ({ get }) => {
    return get(catalogIndexState)[0][1]
  }
})

const catalogURLState = atom<string>({
  key: 'catalogURL',
  default: defaultCatalogURLState
})

export function useCatalogURL (): [string, SetterOrUpdater<string>] {
  return useRecoilState(catalogURLState)
}

const catalogState = selector<ICatalog>({
  key: 'catalog',
  get: async ({ get }) => {
    const catalogUrl = get(catalogURLState)
    return await fetchCatalog(catalogUrl)
  }
})

export function useCatalog (): ICatalog {
  return useRecoilValue<ICatalog>(catalogState)
}

const globalParametersState = atom<IParameters>({
  key: 'global',
  default: {}
})

const editingGlobalParametersState = atom<boolean>({
  key: 'editingGlobal',
  default: false
})

export function useEditGlobalParameters (): [boolean, SetterOrUpdater<boolean>] {
  return useRecoilState(editingGlobalParametersState)
}

const workflowNodesState = atom<IWorkflowNode[]>({
  key: 'workflowNodes',
  default: []
})

type IFormSelection = false | 'global' | number

const formSelectionState = atom<IFormSelection>({
  key: 'formSelection',
  default: false
})

interface UseFormSelection {
  editGlobal: () => void
  editNode: (nodeIndex: number) => void
  clearSelection: () => void
  isSelected: boolean
  isGlobalSelected: boolean
  isNodeSelected: boolean
  selectedNodeIndex: number
}

export function useFormSelection (): UseFormSelection {
  const [formSelection, setFormSelection] = useRecoilState(formSelectionState)
  return {
    editGlobal () {
      setFormSelection('global')
    },
    editNode (nodeIndex: number) {
      setFormSelection(nodeIndex)
    },
    clearSelection () {
      setFormSelection(false)
    },
    isSelected: formSelection !== false,
    isGlobalSelected: formSelection === 'global',
    isNodeSelected: typeof formSelection === 'number',
    selectedNodeIndex: formSelection as number
  }
}

// Keep reference to submit button inside a rjsf form, so the button can be activated outside the form
// See https://github.com/rjsf-team/react-jsonschema-form/issues/500#issuecomment-849051041
// The current approach of using a singleton to store the active submit button,
// makes it impossible to have multiple forms renderede at the same time
const activeSubmitButtonState = atom<HTMLButtonElement | undefined>({
  key: 'activeSubmitButton',
  default: undefined
})

export function useSetActiveSubmitButton (): (instance: HTMLButtonElement | null) => void {
  return useSetRecoilState(activeSubmitButtonState) as (instance: HTMLButtonElement | null) => void
}

export function useActiveSubmitButton (): HTMLButtonElement | undefined {
  return useRecoilValue(activeSubmitButtonState)
}

const filesState = atom<IFiles>({
  key: 'files',
  default: {}
})

const globalFormDataState = selector<IParameters>({
  key: 'globalFormData',
  get: ({ get }) => {
    const parameters = get(globalParametersState)
    const files = get(filesState)
    const catalog = get(catalogState)
    const formData = groupParameters(internalizeDataUrls(parameters, files), catalog.global.uiSchema)
    return formData
  },
  set: ({ get, set }, inlinedParameters) => {
    if (inlinedParameters === undefined) {
      return
    }
    const files = get(filesState)
    const newFiles = { ...files }
    const catalog = get(catalogState)
    let parameters: IParameters
    if (inlinedParameters instanceof DefaultValue) {
      parameters = {}
    } else {
      parameters = externalizeDataUrls(unGroupParameters(inlinedParameters, catalog.global.uiSchema), newFiles)
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
    const index = get(formSelectionState)
    const nodes = get(workflowNodesState)
    if (typeof index === 'number' && index in nodes) {
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
    const catalogNode = catalog.nodes.find((n) => n.id === node.id)
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
    const formData = groupParameters(internalizeDataUrls(node.parameters, files), catalogNode.uiSchema)
    return formData
  },
  set: ({ set, get }, inlinedParameters) => {
    if (inlinedParameters === undefined) {
      return
    }
    const catalogNode = get(selectedCatalogNodeState)
    if (catalogNode === undefined) {
      return
    }
    const files = get(filesState)
    const newFiles = { ...files }
    let parameters: IParameters
    if (inlinedParameters instanceof DefaultValue) {
      parameters = {}
    } else {
      parameters = externalizeDataUrls(unGroupParameters(inlinedParameters, catalogNode.uiSchema), newFiles)
    }
    const nodes = get(workflowNodesState)
    const selectedNodeIndex = get(formSelectionState)
    if (typeof selectedNodeIndex === 'number') {
      const newNode = { ...nodes[selectedNodeIndex], parameters }
      const newNodes = replaceItemAtIndex(nodes, selectedNodeIndex, newNode)
      const global = get(globalParametersState)
      const newUsedFiles = dropUnusedFiles(global, newNodes, newFiles)
      set(workflowNodesState, newNodes)
      set(filesState, newUsedFiles)
    }
  }
})

export function useSelectedNodeFormData (): [IParameters | undefined, SetterOrUpdater<IParameters | undefined>] {
  return useRecoilState(selectedNodeFormDataState)
}

export function useLoadWorkflowArchive (): (archiveURL: string) => Promise<void> {
  const catalog = useCatalog()
  const setNodes = useSetRecoilState(workflowNodesState)
  const setFiles = useSetRecoilState(filesState)
  const setGlobal = useSetRecoilState(globalFormDataState)

  return async function (archiveURL: string) {
    const r = await loadWorkflowArchive(archiveURL, catalog)
    setNodes(r.nodes)
    setFiles(r.files)
    setGlobal(r.global)
  }
}

interface UseWorkflowIO {
  deleteNode: (nodeIndex: number) => void
  save: () => Promise<void>
  clear: () => void

}

export function useWorkflowIO (): UseWorkflowIO {
  const [global, setGlobal] = useRecoilState(globalParametersState)
  const [nodes, setNodes] = useRecoilState(workflowNodesState)
  const [files, setFiles] = useRecoilState(filesState)
  const { isNodeSelected, selectedNodeIndex, clearSelection, editNode } = useFormSelection()

  return {
    deleteNode (nodeIndex: number) {
      if (isNodeSelected) {
        if (nodeIndex === selectedNodeIndex) {
          clearSelection()
        } else if (nodeIndex < selectedNodeIndex) {
          editNode(selectedNodeIndex - 1)
        }
      }
      const newNodes = removeItemAtIndex(nodes, nodeIndex)
      const newFiles = dropUnusedFiles(global, newNodes, files)
      setFiles(newFiles)
      setNodes(newNodes)
    },
    clear () {
      const blankNodes = removeAllItems(nodes)
      const blankGlobals = emptyParams()
      const blankFiles = clearFiles()
      setNodes(blankNodes)
      setGlobal(blankGlobals)
      setFiles(blankFiles)
    },
    async save () {
      await saveArchive(nodes, global, files)
    }
  }
}

interface UseWorkflow {
  nodes: IWorkflowNode[]
  addNodeToWorkflow: (nodeId: string) => void
  addNodeToWorkflowAt: (nodeId: string, targetIndex: number) => void
  moveNode: (sourceIndex: number, targetIndex: number) => void
}

export function useWorkflowNodes (): UseWorkflow {
  const [nodes, setNodes] = useRecoilState(workflowNodesState)
  const { isSelected, editNode, isNodeSelected, clearSelection } = useFormSelection()

  return {
    nodes,
    addNodeToWorkflowAt (nodeId: string, targetIndex: number) {
      setNodes((oldNodes) => {
        const newNodes = [...oldNodes, { id: nodeId, parameters: {} }]
        return moveItem(newNodes, newNodes.length - 1, targetIndex)
      })
      if (!isSelected) {
        editNode(targetIndex)
      }
    },
    addNodeToWorkflow (nodeId: string) {
      setNodes((oldNodes) => [...oldNodes, { id: nodeId, parameters: {} }])
      if (!isSelected) {
        editNode(nodes.length)
      }
    },
    moveNode (sourceIndex: number, targetIndex: number) {
      const newNodes = moveItem(nodes, sourceIndex, targetIndex)
      setNodes(newNodes)
      if (isNodeSelected) {
        // TODO do not change selected node.
        // For example given topaa node is selected and its parameter form is shown
        // then moving it or other nodes should keep the parameter form of topaa shown.
        clearSelection()
      }
    }
  }
}

export function useFiles (): IFiles {
  return useRecoilValue(filesState)
}

export function useText (): string {
  const nodes = useRecoilValue(workflowNodesState)
  const global = useRecoilValue(globalParametersState)
  return workflow2tomltext(nodes, global)
}
