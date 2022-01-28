import { load } from 'js-yaml'
import { atom, selector, useRecoilState, useRecoilValue } from 'recoil'
import { toast } from 'react-toastify'

import { externalizeDataUrls } from './dataurls'
import { readArchive, saveArchive } from './archive'
import { ICatalog, IWorkflowNode, IFiles, IParameters, ICatalogNode } from './types'
import { parseWorkflow, workflow2tomltext } from './toml'
import { catalogURLchoices } from './constants'
import { validateWorkflow, validateCatalog } from './validate'
import { moveItem, removeItemAtIndex, replaceItemAtIndex } from './utils/array'

export const catalogURLState = atom<string>({
  key: 'catalogURL',
  default: catalogURLchoices[0][1]
})

const catalogState = selector<ICatalog>({
  key: 'catalog',
  get: async ({ get }) => {
    const catalogUrl = get(catalogURLState)
    try {
      const response = await fetch(catalogUrl)
      const body = await response.text()
      const catalog = load(body)
      const errors = validateCatalog(catalog)
      if (errors.length > 0) {
        // TODO notify user of bad catalog
        toast.error('Loading catalog failed')
        return {} as ICatalog
      }
      // TODO Only report success when user initiated catalog loading, not when page is loaded
      // toast.success('Loading catalog completed')
      return catalog as ICatalog
    } catch (error) {
      toast.error('Loading catalog failed')
      return {} as ICatalog
    }
  }
})

export function useCatalog (): ICatalog {
  return useRecoilValue<ICatalog>(catalogState)
}

const globalKeysState = selector<Set<string>>({
  key: 'globalKeys',
  get: ({ get }) => {
    const { global } = get(catalogState)
    let keys: string[] = []
    if (global?.schema.properties != null) {
      keys = Object.keys(global.schema.properties)
    }
    return new Set(keys)
  }
})

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

export function useWorkflow () {
  const [nodes, setNodes] = useRecoilState(workflowNodesState)
  const [global, setGlobal] = useRecoilState(globalParametersState)
  const [editingGlobal, setEditingGlobal] = useRecoilState(editingGlobalParametersState)
  const [selectedNodeIndex, setSelectedNodeIndex] = useRecoilState(selectedNodeIndexState)
  const [files, setFiles] = useRecoilState(filesState)
  const catalog = useCatalog()
  const globalKeys = useRecoilValue(globalKeysState)

  return {
    nodes,
    editingGlobal,
    global,
    toggleGlobalEdit () {
      setEditingGlobal(!editingGlobal)
      setSelectedNodeIndex(-1)
    },
    addNodeToWorkflow (nodeId: string) {
      setNodes([...nodes, { id: nodeId, parameters: {} }])
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
      // TODO forget files that where only mentioned in removed node
      setNodes(newNodes)
    },
    clearNodeSelection: () => setSelectedNodeIndex(-1),
    setParameters (inlinedParameters: unknown) {
      const newFiles = { ...files }
      // TODO forget files that are no longer refered to in parameters
      const parameters = externalizeDataUrls(inlinedParameters, newFiles)
      if (editingGlobal) {
        setGlobal(parameters)
      } else {
        const newNode = { ...nodes[selectedNodeIndex], parameters }
        const newNodes = replaceItemAtIndex(nodes, selectedNodeIndex, newNode)
        setNodes(newNodes as any)
      }
      setFiles(newFiles)
    },
    async loadWorkflowArchive (archiveURL: string) {
      try {
        const { tomlstring, files: newFiles } = await readArchive(archiveURL, catalog.nodes)
        const { nodes: newNodes, global: newGlobal } = parseWorkflow(tomlstring, globalKeys)
        const errors = validateWorkflow({
          global: newGlobal,
          nodes: newNodes
        }, {
          global: catalog.global,
          nodes: catalog.nodes
        })
        if (errors.length > 0) {
          // give feedback to users about errors
          toast.error('Workflow archive is invalid. See DevTools console for errors')
          console.error(errors)
        } else {
          setNodes(newNodes)
          setFiles(newFiles)
          setGlobal(newGlobal)
        }
      } catch (error) {
        toast.error('Workflow archive is failed to load. See DevTools console for errors')
        console.error(error)
      }
    },
    async save () {
      await saveArchive(nodes, global, files)
    },
    moveNodeDown (nodeIndex: number) {
      if (nodeIndex + 1 < nodes.length) {
        const newNodes = moveItem(nodes, nodeIndex, 1)
        setSelectedNodeIndex(-1)
        setNodes(newNodes)
      }
    },
    moveNodeUp (nodeIndex: number) {
      if (nodeIndex > 0) {
        const newNodes = moveItem(nodes, nodeIndex, -1)
        setSelectedNodeIndex(-1)
        setNodes(newNodes)
      }
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
