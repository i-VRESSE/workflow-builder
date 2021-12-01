import { load } from "js-yaml";
import { atom, selector, useRecoilState, useRecoilValue } from "recoil";
import type { JSONSchema7} from 'json-schema'
import { UiSchema } from "@rjsf/core";
import { Section, stringify } from "@ltd/j-toml";


export interface INode {
    id: string
    label: string
    schema: JSONSchema7
    uiSchema?: UiSchema
    description: string
}

export interface ICatalog {
    nodes: INode[]
}

const catalogState = selector<ICatalog>({
    key:'catalog',
    get: async () => {
        const catalogUrl = new URL('/catalog.yaml', import.meta.url).href
        const response = await fetch(catalogUrl)
        const body = await response.text()
        return load(body) as ICatalog
    }
})


export function useCatalog() {
    return useRecoilValue<ICatalog>(catalogState);
}

export interface IStep {
    id: string
    parameters: Record<string, unknown>
}

const workflowState = atom<IStep[]>({
    key:'steps',
    default: []
})

const selectedStepState = atom<number>({
    key: 'selectedStep',
    default: -1
})

function replaceItemAtIndex<V>(arr: V[], index: number, newValue: V) {
    return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
  }

  function removeItemAtIndex<V>(arr: V[], index: number) {
    return [...arr.slice(0, index), ...arr.slice(index + 1)];
  }

export function useWorkflow() {
    const [steps, setSteps] = useRecoilState(workflowState)
    const [selectedStep, setSelectedStep] = useRecoilState(selectedStepState)

    return {
        steps,
        selectedStep,
        addNodeToWorkflow: (nodeId: string) => {
            setSteps([...steps, {id: nodeId, parameters: {}}])
        },
        selectStep: (stepIndex: number) => setSelectedStep(stepIndex),
        deleteStep: (stepIndex: number) => {
            if (stepIndex === selectedStep) {
                setSelectedStep(-1)
            }
            const newSteps = removeItemAtIndex(steps, stepIndex)
            setSteps(newSteps)
        },
        clearStepSelection: () => setSelectedStep(-1),
        setParameters: (parameters: unknown) => {
            const newStep = {...steps[selectedStep], parameters}
            const newSteps = replaceItemAtIndex(steps, selectedStep, newStep)
            setSteps(newSteps as any)
        }
    }
}

function steps2tomltable(steps: IStep[]) {
    const table: Record<string, unknown> = {}
    const track: Record<string, number> = {}
    for (const step of steps) {
        if (step.id === 'global') {
            Object.entries(step.parameters).forEach(
                ([k,v]) => table[k] = v
            )
        } else {
            if (!(step.id in track)) {
                track[step.id] = 0
            }
            track[step.id]++
            const section = step.id + '.' + track[step.id]
            table[section] = Section(step.parameters as any)
        }
    }
    return table
}

export function useCode() {
    const {steps} = useWorkflow()
    const table = steps2tomltable(steps)
    const text = stringify(table as any, { newline: "\n", integer: Number.MAX_SAFE_INTEGER})
    return text
}

export function useCodeUrl() {
    return "data:application/json;base64," + btoa(useCode())
}