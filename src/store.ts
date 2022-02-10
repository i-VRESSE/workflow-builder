import { atom, selector, useRecoilState, useRecoilValue } from 'recoil'

import { externalizeDataUrls } from './dataurls'
import { saveArchive } from './archive'
import { ICatalog, IWorkflowNode, IFiles, IParameters, ICatalogNode, ICatalogIndex } from './types'
import { workflow2tomltext } from './toml'
import { dropUnusedFiles, loadWorkflowArchive } from './workflow'
import { fetchCatalogIndex, fetchCatalog } from './catalog'
import { catalogIndexURL } from './constants'
import { removeItemAtIndex, replaceItemAtIndex, moveItem, swapItem } from './utils/array'

export const catalogIndexState = selector<ICatalogIndex>({
  key: 'catalogIndex',
  get: async () => {
    return await fetchCatalogIndex(catalogIndexURL)
  }
})

const defaultCatalogURLState = selector<string>({
  key: 'defaultCatalogURL',
  get: ({ get }) => {
    return get(catalogIndexState)[0][1]
  }
})

export const catalogURLState = atom<string>({
  key: 'catalogURL',
  default: defaultCatalogURLState
})

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

const workflowNodesState = atom<IWorkflowNode[]>({
  key: 'workflowNodes',
  default: []
})

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

export function useSelectNodeIndex (): number {
  return useRecoilValue(selectedNodeIndexState)
}

const filesState = atom<IFiles>({
  key: 'files',
  default: {}
})

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

interface UseWorkflow {
  nodes: IWorkflowNode[]
  editingGlobal: boolean
  global: IParameters
  toggleGlobalEdit: () => void
  addNodeToWorkflow: (nodeId: string) => void
  addNodeToWorkflowAt: (nodeId: string, targetIndex: number) => void
  setGlobalParameters: (inlinedParameters: IParameters) => void
  setNodeParameters: (inlinedParameters: IParameters) => void
  loadWorkflowArchive: (archiveURL: string) => Promise<void>
  save: () => Promise<void>
  deleteNode: (nodeIndex: number) => void
  selectNode: (nodeIndex: number) => void
  clearNodeSelection: () => void
  moveNodeDown: (nodeIndex: number) => void
  moveNodeUp: (nodeIndex: number) => void
  moveNode: (sourceIndex: number, targetIndex: number) => void
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
    addNodeToWorkflowAt (nodeId: string, targetIndex: number) {
      setNodes((oldNodes) => {
        const newNodes = [...oldNodes, { id: nodeId, parameters: {} }]
        return moveItem(newNodes, newNodes.length - 1, targetIndex)
      })
      if (selectedNodeIndex === -1 && !editingGlobal) {
        setSelectedNodeIndex(targetIndex)
      }
    },
    addNodeToWorkflow (nodeId: string) {
      setNodes((oldNodes) => [...oldNodes, { id: nodeId, parameters: {} }])
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
      if (nodeIndex === selectedNodeIndex) {
        setSelectedNodeIndex(-1)
      }
      const newNodes = removeItemAtIndex(nodes, nodeIndex)
      const newFiles = dropUnusedFiles(global, newNodes, files)
      setFiles(newFiles)
      setNodes(newNodes)
    },
    clearNodeSelection: () => setSelectedNodeIndex(-1),
    setGlobalParameters (inlinedParameters: IParameters) {
      const newFiles = { ...files }
      const parameters = externalizeDataUrls(inlinedParameters, newFiles)
      const newUsedFiles = dropUnusedFiles(parameters, nodes, newFiles)
      setGlobal(parameters)
      setFiles(newUsedFiles)
    },
    setNodeParameters (inlinedParameters: IParameters) {
      const newFiles = { ...files }
      const parameters = externalizeDataUrls(inlinedParameters, newFiles)
      const newNode = { ...nodes[selectedNodeIndex], parameters }
      const newNodes = replaceItemAtIndex(nodes, selectedNodeIndex, newNode)
      const newUsedFiles = dropUnusedFiles(global, newNodes, newFiles)
      setNodes(newNodes)
      setFiles(newUsedFiles)
    },
    async loadWorkflowArchive (archiveURL: string) {
      const r = await loadWorkflowArchive(archiveURL, catalog)
      setNodes(r.nodes)
      setFiles(r.files)
      setGlobal(r.global)
    },
    async save () {
      await saveArchive(nodes, global, files)
    },
    moveNodeDown (nodeIndex: number) {
      if (nodeIndex + 1 < nodes.length) {
        const newNodes = swapItem(nodes, nodeIndex, 1)
        setSelectedNodeIndex(-1)
        setNodes(newNodes)
      }
    },
    moveNodeUp (nodeIndex: number) {
      if (nodeIndex > 0) {
        const newNodes = swapItem(nodes, nodeIndex, -1)
        setSelectedNodeIndex(-1)
        setNodes(newNodes)
      }
    },
    moveNode (sourceIndex: number, targetIndex: number) {
      const newNodes = moveItem(nodes, sourceIndex, targetIndex)
      setSelectedNodeIndex(-1)
      setNodes(newNodes)
    }
  }
}

export function useFiles (): IFiles {
  return useRecoilValue(filesState)
}

export function useText (): string {
  const { nodes, global } = useWorkflow()
  return workflow2tomltext(nodes, global)
}
