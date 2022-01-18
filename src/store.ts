import { load } from 'js-yaml'
import { atom, selector, useRecoilState, useRecoilValue } from 'recoil'
import { externalizeDataUrls } from './dataurls'
import { readArchive, saveArchive } from './archive'
import { ICatalog, IStep, IFiles } from './types'
import { parseWorkflow, steps2tomltext } from './toml'

export const catalogURLState = atom<string>({
  key: 'catalogURL',
  default: new URL('/catalog.yaml', import.meta.url).href
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

const workflowState = atom<IStep[]>({
  key: 'steps',
  default: []
})

const selectedStepState = atom<number>({
  key: 'selectedStep',
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
  const [steps, setSteps] = useRecoilState(workflowState)
  const [selectedStep, setSelectedStep] = useRecoilState(selectedStepState)
  const { files, setFiles } = useFiles()
  const { nodes } = useCatalog()

  return {
    steps,
    selectedStep,
    addNodeToWorkflow (nodeId: string) {
      setSteps([...steps, { id: nodeId, parameters: {} }])
      if (selectedStep === -1) {
        setSelectedStep(steps.length)
      }
    },
    selectStep: (stepIndex: number) => setSelectedStep(stepIndex),
    deleteStep (stepIndex: number) {
      if (stepIndex === selectedStep) {
        setSelectedStep(-1)
      }
      const newSteps = removeItemAtIndex(steps, stepIndex)
      setSteps(newSteps)
    },
    clearStepSelection: () => setSelectedStep(-1),
    setParameters (inlinedParameters: unknown) {
      const newFiles = { ...files }
      const parameters = externalizeDataUrls(inlinedParameters, newFiles)
      const newStep = { ...steps[selectedStep], parameters }
      const newSteps = replaceItemAtIndex(steps, selectedStep, newStep)
      setSteps(newSteps as any)
      setFiles(newFiles)
    },
    async loadWorkflowArchive (archiveURL: string) {
      const { tomlstring, files: newFiles } = await readArchive(archiveURL, nodes)
      const newSteps = parseWorkflow(tomlstring)
      setSteps(newSteps)
      setFiles(newFiles)
    },
    loadWorkflow (tomlstring: string) {
      // TODO load zip file
      const newSteps = parseWorkflow(tomlstring)
      const newFiles = {}
      newSteps.forEach(s => {
        s.parameters = externalizeDataUrls(s.parameters, newFiles)
      })
      setSteps(newSteps)
      setFiles(newFiles)
    },
    async save () {
      await saveArchive(steps, nodes, files)
    },
    moveStepDown (stepIndex: number) {
      if (stepIndex + 1 < steps.length) {
        const newSteps = moveStep(steps, stepIndex, 1)
        setSelectedStep(-1)
        setSteps(newSteps)
      }
    },
    moveStepUp (stepIndex: number) {
      if (stepIndex > 0) {
        const newSteps = moveStep(steps, stepIndex, -1)
        setSelectedStep(-1)
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
  const { steps } = useWorkflow()
  const { nodes } = useCatalog()
  return steps2tomltext(steps, nodes)
}

export function useTextUrl () {
  const text = useText()
  return 'data:application/json;base64,' + btoa(text)
}
