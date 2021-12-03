import { load } from "js-yaml";
import { atom, selector, useRecoilState, useRecoilValue } from "recoil";
import type { JSONSchema7} from 'json-schema'
import { UiSchema } from "@rjsf/core";
import { parse, Section, stringify } from "@ltd/j-toml";


export interface INode {
    id: string
    label: string
    schema: JSONSchema7
    uiSchema?: UiSchema
    description: string
    category: string
}

export interface ICategory {
    name: string
}

export interface ICatalog {
    categories: ICategory[]
    nodes: INode[]
    templates: Record<string, string>
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

function parseWorkflow(workflow: string) {
    const table = parse(workflow, { bigint: false})
    const global: Record<string, unknown> = {}
    const nonGlobalSteps: IStep[] = [];
    Object.entries(table).forEach(([k, v]) => {
        if (typeof v === 'object' && Object.prototype.toString.call(v) !== '[object Array]') {
            nonGlobalSteps.push({
                id: k,
                parameters: v
            } as any)
        } else {
            global[k] = v
        }
    })
    const newSteps = [
        {
            id: 'global',
            parameters: global
        },
        ...nonGlobalSteps
    ]
    return newSteps
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
        },
        loadWorkflow: (tomlstring: string) => {
            const newSteps = parseWorkflow(tomlstring);
            setSteps(newSteps)
        },
        moveStepDown(stepIndex: number) {
            if (stepIndex + 1 < steps.length ) {
                const newSteps = moveStep(steps, stepIndex, 1);
                setSelectedStep(-1)
                setSteps(newSteps)
            }
        },
        moveStepUp(stepIndex: number) {
            if (stepIndex > 0) {
                const newSteps = moveStep(steps, stepIndex, -1);
                setSelectedStep(-1)
                setSteps(newSteps)
            }
        }
    }
}

function moveStep(steps: IStep[], stepIndex: number, direction: number) {
    const step = steps[stepIndex];
    const swappedIndex = stepIndex + direction;
    const swappedStep = steps[swappedIndex];
    const newSteps = replaceItemAtIndex(
        replaceItemAtIndex(steps, stepIndex, swappedStep),
        swappedIndex,
        step
    );
    return newSteps;
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
            const section = track[step.id] > 1 ? step.id + '.' + track[step.id] : step.id
            table[section] = Section(step.parameters as any)
        }
    }
    return table
}

export function useText() {
    const {steps} = useWorkflow()
    const table = steps2tomltable(steps)
    const text = stringify(table as any, { newline: "\n", integer: Number.MAX_SAFE_INTEGER})
    return text
}

export function useTextUrl() {
    return "data:application/json;base64," + btoa(useText())
}