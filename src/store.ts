import { load } from 'js-yaml'
import { atom, selector, useRecoilState, useRecoilValue } from 'recoil'
import { externalizeDataUrls } from './dataurls'
import { readArchive, saveArchive } from './archive'
import { ICatalog, IStep, IFiles, IParameters } from './types'
import { parseWorkflow, workflow2tomltext } from './toml'
import { catalogURLchoices } from './constants'

export const catalogURLState = atom<string>({
  key: 'catalogURL',
  default: catalogURLchoices[0][1]
})

const catalogState = selector<ICatalog>({
  key: 'catalog',
  get: async ({ get }) => {
    const catalogUrl = get(catalogURLState)
    const response = await fetch(catalogUrl)
    const body = await response.text()
    return load(body) as ICatalog
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

export function useWorkflow () {
  const [steps, setSteps] = useRecoilState(stepsState)
  const [global, setGlobal] = useRecoilState(globalParametersState)
  const [editingGlobal, setEditingGlobal] = useRecoilState(editingGlobalParametersState)
  const [selectedStepIndex, setSelectedStepIndex] = useRecoilState(selectedStepIndexState)
  const { files, setFiles } = useFiles()
  const { nodes } = useCatalog()
  const globalKeys = useRecoilValue(globalKeysState);

  return {
    steps,
    selectedStep: selectedStepIndex, // TODO rename to selectedStepIndex
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
      const { tomlstring, files: newFiles } = await readArchive(archiveURL, nodes)
      const { steps: newSteps, global: newGlobal } = parseWorkflow(tomlstring, globalKeys)
      setSteps(newSteps)
      setFiles(newFiles)
      setGlobal(newGlobal)
    },
    loadWorkflow (tomlstring: string) {
      // TODO load zip file
      const { steps: newSteps, global: newGlobal } = parseWorkflow(tomlstring, globalKeys)
      const newFiles = {}
      newSteps.forEach(s => {
        s.parameters = externalizeDataUrls(s.parameters, newFiles)
      })
      setSteps(newSteps)
      setGlobal(externalizeDataUrls(newGlobal, newFiles))
      setFiles(newFiles)
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
