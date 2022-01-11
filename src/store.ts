import { load } from 'js-yaml'
import { atom, selector, useRecoilState, useRecoilValue } from 'recoil'
import { externalizeDataUrls } from './dataurls'
import { saveArchive } from './archive'
import { ICatalog, IStep, IFiles } from './types'
import { parseWorkflow, steps2tomltext } from './toml'

const catalogState = selector<ICatalog>({
  key: 'catalog',
  get: async () => {
    const catalogUrl = new URL('/catalog.yaml', import.meta.url).href
    const response = await fetch(catalogUrl)
    const body = await response.text()
    return load(body) as ICatalog
  }
})

export function useCatalog () {
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
  const { files, upsert } = useFiles()
  const { nodes } = useCatalog()

  return {
    steps,
    selectedStep,
    addNodeToWorkflow (nodeId: string) {
      setSteps([...steps, { id: nodeId, parameters: {} }])
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
      const newFiles = {}
      const parameters = externalizeDataUrls(inlinedParameters, newFiles)
      const newStep = { ...steps[selectedStep], parameters }
      const newSteps = replaceItemAtIndex(steps, selectedStep, newStep)
      setSteps(newSteps as any)
      Object.entries(newFiles).forEach(([k, v]) => upsert(k, v as any))
    },
    loadWorkflow (tomlstring: string) {
      // TODO load zip file
      const newSteps = parseWorkflow(tomlstring)
      setSteps(newSteps)
    },
    async save () {
      await saveArchive(steps, nodes, files, 'workflow.cfg', 'workflow.zip')
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
    upsert (filename: string, body: string) {
      const newFiles = { ...files }
      newFiles[filename] = body
      setFiles(newFiles)
    },
    delete (filename: string) {
      const newFiles = { ...files }
      delete newFiles[filename]
      setFiles(newFiles)
    }
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
