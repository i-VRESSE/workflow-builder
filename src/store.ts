import { load } from 'js-yaml'
import { atom, selector, useRecoilState, useRecoilValue } from 'recoil'
import { externalizeDataUrls } from './dataurls'
import { readArchive, saveArchive } from './archive'
import { ICatalog, IStep, IFiles, IParameters, INode } from './types'
import { parseWorkflow, workflow2tomltext } from './toml'
import { catalogURLchoices } from './constants'
import { validateWorkflow, validateCatalog } from './validate'
import { toast } from 'react-toastify'

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

const stepsState = atom<IStep[]>({
  key: 'steps',
  default: []
})

const selectedStepIndexState = atom<number>({
  key: 'selectedStepIndex',
  default: -1
})

export function useSelectStepIndex (): number {
  return useRecoilValue(selectedStepIndexState)
}

const filesState = atom<IFiles>({
  key: 'files',
  default: {}
})

function replaceItemAtIndex<V> (arr: V[], index: number, newValue: V) {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)]
}

function removeItemAtIndex<V> (arr: V[], index: number) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)]
}

const selectedStepState = selector<IStep | undefined>({
  key: 'selectedStep',
  get: ({ get }) => {
    const index = get(selectedStepIndexState)
    const steps = get(stepsState)
    if (index in steps) {
      return steps[index]
    }
    return undefined
  }
})

export function useSelectedStep (): IStep | undefined {
  return useRecoilValue(selectedStepState)
}

const selectedNodeCatalogState = selector<INode | undefined>({
  key: 'selectedNodeCatalogState',
  get: ({ get }) => {
    const step = get(selectedStepState)
    if (step === undefined) {
      return undefined
    }
    const catalog = get(catalogState)
    const node = catalog.nodes.find((n) => n.id === step.id)
    if (node === undefined) {
      return undefined
    }
    return node
  }
})

export function useSelectedNodeCatalog (): INode | undefined {
  return useRecoilValue(selectedNodeCatalogState)
}

export function useWorkflow () {
  const [steps, setSteps] = useRecoilState(stepsState)
  const [global, setGlobal] = useRecoilState(globalParametersState)
  const [editingGlobal, setEditingGlobal] = useRecoilState(editingGlobalParametersState)
  const [selectedStepIndex, setSelectedStepIndex] = useRecoilState(selectedStepIndexState)
  const { files, setFiles } = useFiles()
  const { global: globalDescription, nodes } = useCatalog()
  const globalKeys = useRecoilValue(globalKeysState)

  return {
    steps,
    editingGlobal,
    global,
    toggleGlobalEdit () {
      setEditingGlobal(!editingGlobal)
      setSelectedStepIndex(-1)
    },
    addNodeToWorkflow (nodeId: string) {
      setSteps([...steps, { id: nodeId, parameters: {} }])
      if (selectedStepIndex === -1 && !editingGlobal) {
        setSelectedStepIndex(steps.length)
      }
    },
    selectStep: (stepIndex: number) => {
      if (editingGlobal) {
        setEditingGlobal(false)
      }
      setSelectedStepIndex(stepIndex)
    },
    deleteStep (stepIndex: number) {
      if (stepIndex === selectedStepIndex) {
        setSelectedStepIndex(-1)
      }
      const newSteps = removeItemAtIndex(steps, stepIndex)
      // TODO forget files that where only mentioned in removed step
      setSteps(newSteps)
    },
    clearStepSelection: () => setSelectedStepIndex(-1),
    setParameters (inlinedParameters: unknown) {
      const newFiles = { ...files }
      // TODO forget files that are no longer refered to in parameters
      const parameters = externalizeDataUrls(inlinedParameters, newFiles)
      if (editingGlobal) {
        setGlobal(parameters)
      } else {
        const newStep = { ...steps[selectedStepIndex], parameters }
        const newSteps = replaceItemAtIndex(steps, selectedStepIndex, newStep)
        setSteps(newSteps as any)
      }
      setFiles(newFiles)
    },
    async loadWorkflowArchive (archiveURL: string) {
      try {
        const { tomlstring, files: newFiles } = await readArchive(archiveURL, nodes)
        const { steps: newSteps, global: newGlobal } = parseWorkflow(tomlstring, globalKeys)
        const errors = validateWorkflow({
          global: newGlobal,
          steps: newSteps
        }, {
          global: globalDescription,
          nodes: nodes
        })
        if (errors.length > 0) {
          // give feedback to users about errors
          toast.error('Workflow archive is invalid. See DevTools console for errors')
          console.error(errors)
        } else {
          setSteps(newSteps)
          setFiles(newFiles)
          setGlobal(newGlobal)
        }
      } catch (error) {
        toast.error('Workflow archive is failed to load. See DevTools console for errors')
        console.error(error)
      }
    },
    async save () {
      await saveArchive(steps, global, files)
    },
    moveStepDown (stepIndex: number) {
      if (stepIndex + 1 < steps.length) {
        const newSteps = moveStep(steps, stepIndex, 1)
        setSelectedStepIndex(-1)
        setSteps(newSteps)
      }
    },
    moveStepUp (stepIndex: number) {
      if (stepIndex > 0) {
        const newSteps = moveStep(steps, stepIndex, -1)
        setSelectedStepIndex(-1)
        setSteps(newSteps)
      }
    }
  }
}

export function useFiles () {
  const [files, setFiles] = useRecoilState(filesState)

  return {
    files,
    setFiles
  }
}

function moveStep (steps: IStep[], stepIndex: number, direction: number) {
  const step = steps[stepIndex]
  const swappedIndex = stepIndex + direction
  const swappedStep = steps[swappedIndex]
  const newSteps = replaceItemAtIndex(
    replaceItemAtIndex(steps, stepIndex, swappedStep),
    swappedIndex,
    step
  )
  return newSteps
}

export function useText () {
  const { steps, global } = useWorkflow()
  return workflow2tomltext(steps, global)
}

export function useTextUrl () {
  const text = useText()
  return 'data:application/json;base64,' + btoa(text)
}
