import { Section, stringify, parse } from '@ltd/j-toml'
import { IStep, IParameters } from './types'

function isObject (o: unknown): boolean {
  return typeof o === 'object' &&
    Object.prototype.toString.call(o) === '[object Object]'
}

function steps2tomltable (steps: IStep[]) {
  const table: Record<string, unknown> = {}
  const track: Record<string, number> = {}
  for (const step of steps) {
    if (!(step.id in track)) {
      track[step.id] = 0
    }
    track[step.id]++
    const section =
      track[step.id] > 1 ? `${step.id}.${track[step.id]}` : step.id
    const stepParameters: Record<string, unknown> = {}
    // TODO make recursive so `items.input.items.hisd: nesting` is also applied
    Object.entries(step.parameters).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length > 0 && isObject(v[0])) {
        // A value that is an array of objects will have each of its objects as a section
        stepParameters[k] = v.map(d => Section(d))
      } else {
        stepParameters[k] = v
      }
    })
    table[section] = Section(stepParameters as any)
  }
  return table
}

export function workflow2tomltext (
  steps: IStep[],
  global: IParameters
) {
  const table = {
    ...steps2tomltable(steps),
    ...global
  }
  const text = stringify(table as any, {
    newline: '\n',
    integer: Number.MAX_SAFE_INTEGER
  })
  return text
}

export function parseWorkflow (workflow: string, globalKeys: Set<string>) {
  const table = parse(workflow, { bigint: false })
  const global: Record<string, unknown> = {}
  const steps: IStep[] = []
  const sectionwithindex = /\.\d+$/
  Object.entries(table).forEach(([k, v]) => {
    const section = k.replace(sectionwithindex, '')
    if (globalKeys.has(section)) {
      global[k] = v
    } else {
      steps.push({
        id: section,
        parameters: v as IParameters
      })
    }
  })
  // TODO validate steps and global parameters against schemas in catalog
  return { steps, global }
}
