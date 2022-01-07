import { load } from "js-yaml";
import { atom, selector, useRecoilState, useRecoilValue } from "recoil";
import type { JSONSchema7 } from "json-schema";
import { UiSchema } from "@rjsf/core";
import { parse, Section, stringify, inline } from "@ltd/j-toml";
import {
  Data64URIReader,
  Data64URIWriter,
  TextReader,
  ZipWriter,
} from "@zip.js/zip.js";

export interface TomlSchema {
  nesting?: "global" | "section" | "inline";
  indexPrefix?: string;
  items?: Record<string, TomlSchema>;
}

export interface INode {
  id: string;
  label: string;
  schema: JSONSchema7;
  uiSchema?: UiSchema;
  tomlSchema?: TomlSchema;
  description: string;
  category: string;
}

export interface ICategory {
  name: string;
}

export interface ICatalog {
  categories: ICategory[];
  nodes: INode[];
  templates: Record<string, string>;
}

const catalogState = selector<ICatalog>({
  key: "catalog",
  get: async () => {
    const catalogUrl = new URL("/catalog.yaml", import.meta.url).href;
    const response = await fetch(catalogUrl);
    const body = await response.text();
    return load(body) as ICatalog;
  },
});

export function useCatalog() {
  return useRecoilValue<ICatalog>(catalogState);
}

export interface IStep {
  id: string;
  parameters: Record<string, unknown>;
}

const workflowState = atom<IStep[]>({
  key: "steps",
  default: [],
});

const selectedStepState = atom<number>({
  key: "selectedStep",
  default: -1,
});

function replaceItemAtIndex<V>(arr: V[], index: number, newValue: V) {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
}

function removeItemAtIndex<V>(arr: V[], index: number) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

function inlineFiles(schema: JSONSchema7, parameters: Record<string, unknown>) {
  Object.entries(schema.properties!)
    .filter(
      ([_, v]) =>
        (v as JSONSchema7).type === "string" &&
        (v as JSONSchema7).format === "data-url"
    )
    .forEach((p) => {
      if (p[0] in parameters) {
        const v = parameters[p[0]] as string;
        try {
          new URL(v);
        } catch (error) {
          // assume is local path like "../data/1a2k_l_u.pdb"
          // TODO handle non URLs
          delete parameters[p[0]];
        }
      }
    });
}

function parseWorkflow(workflow: string) {
  const table = parse(workflow, { bigint: false });
  const global: Record<string, unknown> = {};
  const nonGlobalSteps: IStep[] = [];
  Object.entries(table).forEach(([k, v]) => {
    if (
      typeof v === "object" &&
      Object.prototype.toString.call(v) !== "[object Array]"
    ) {
      nonGlobalSteps.push({
        id: k,
        parameters: v,
      } as any);
    } else {
      global[k] = v;
    }
  });
  const newSteps = [
    {
      id: "global",
      parameters: global,
    },
    ...nonGlobalSteps,
  ];
  return newSteps;
}

export function useWorkflow() {
  const [steps, setSteps] = useRecoilState(workflowState);
  const [selectedStep, setSelectedStep] = useRecoilState(selectedStepState);

  return {
    steps,
    selectedStep,
    addNodeToWorkflow: (nodeId: string) => {
      setSteps([...steps, { id: nodeId, parameters: {} }]);
    },
    selectStep: (stepIndex: number) => setSelectedStep(stepIndex),
    deleteStep: (stepIndex: number) => {
      if (stepIndex === selectedStep) {
        setSelectedStep(-1);
      }
      const newSteps = removeItemAtIndex(steps, stepIndex);
      setSteps(newSteps);
    },
    clearStepSelection: () => setSelectedStep(-1),
    setParameters: (parameters: unknown) => {
      const newStep = { ...steps[selectedStep], parameters };
      const newSteps = replaceItemAtIndex(steps, selectedStep, newStep);
      setSteps(newSteps as any);
    },
    loadWorkflow: (tomlstring: string) => {
      const newSteps = parseWorkflow(tomlstring);
      setSteps(newSteps);
    },
    moveStepDown(stepIndex: number) {
      if (stepIndex + 1 < steps.length) {
        const newSteps = moveStep(steps, stepIndex, 1);
        setSelectedStep(-1);
        setSteps(newSteps);
      }
    },
    moveStepUp(stepIndex: number) {
      if (stepIndex > 0) {
        const newSteps = moveStep(steps, stepIndex, -1);
        setSelectedStep(-1);
        setSteps(newSteps);
      }
    },
  };
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

function steps2tomltable(steps: IStep[], nodes: INode[]) {
  const table: Record<string, unknown> = {};
  const track: Record<string, number> = {};
  for (const step of steps) {
    const schema = nodes.find((n) => n.id === step?.id)?.tomlSchema;
    if (schema?.nesting === "global") {
      Object.entries(step.parameters).forEach(([k, v]) => (table[k] = v));
    } else {
      if (!(step.id in track)) {
        track[step.id] = 0;
      }
      track[step.id]++;
      const section =
        track[step.id] > 1 ? step.id + "." + track[step.id] : step.id;
      const stepParameters: Record<string, unknown> = {};
      // TODO make recursive so `items.input.items.hisd: nesting` is also applied
      Object.entries(step.parameters).forEach(([k, v]) => {
        if (schema && schema.items && k in schema.items) {
          if (schema.items[k].nesting === "section") {
            if (schema.items[k].indexPrefix) {
              const sectionedPararmeter: Record<string, unknown> = {};
              (v as unknown[]).forEach((d: unknown, i: number) => {
                sectionedPararmeter[schema.items![k].indexPrefix! + (i + 1)] =
                  Section(d as any);
              });
              stepParameters[k] = sectionedPararmeter;
            } else {
              stepParameters[k] = Section(v as any);
            }
          } else if (schema.items[k].nesting === "inline") {
            stepParameters[k] = inline(v as any);
          }
        } else {
          stepParameters[k] = v;
        }
      });
      table[section] = Section(stepParameters as any);
    }
  }
  return table;
}

function steps2tomltext(steps: IStep[], nodes: INode[]) {
  const table = steps2tomltable(steps, nodes);
  const text = stringify(table as any, {
    newline: "\n",
    integer: Number.MAX_SAFE_INTEGER,
  });
  return text;
}

export function useText() {
  const { steps } = useWorkflow();
  const { nodes } = useCatalog();
  return steps2tomltext(steps, nodes);
}

export function useTextUrl() {
  const text = useText();
  // console.log(text);
  return "data:application/json;base64," + btoa(text);
}

function isDataURL(value: unknown) {
  return typeof value === "string" && value.startsWith("data:");
}

function dataURL2filename(value: string) {
  // rjsf creates data URLs like `data:text/markdown;name=README.md;base64,Rm9.....`
  return value.split(";")[1].split("=")[1];
}

function externalizeDataUrls(inlinedSteps: IStep[]) {
  const dataFiles: Record<string, string> = {};
  const steps: IStep[] = inlinedSteps.map((s) => {
    const parameters: Record<string, unknown> = { ...s.parameters };
    // {k: 'data:...'}
    Object.entries(s.parameters)
      .filter(([key, value]) => isDataURL(value))
      .forEach(([key, value]) => {
        const fn = dataURL2filename(value as string);
        dataFiles[fn] = value as string;
        parameters[key] = fn;
      });
    // {k: ['data:...']}
    Object.entries(s.parameters)
      .filter(([key, value]) => Array.isArray(value))
      .forEach(([key, value]) => {
        parameters[key] = (value as string[]).map((d) => {
          if (isDataURL(d)) {
            const fn = dataURL2filename(d as string);
            dataFiles[fn] = d as string;
            return fn;
          } else {
            return d;
          }
        });
      });
    // {k: [{k2: 'data:...'}]}
    // TODO implement or replace blocks above with recursive code
    return { id: s.id, parameters };
  });

  return {
    dataFiles,
    steps,
  };
}

const archiveState = selector<string>({
  key: "archive",
  get: async ({ get }) => {
    const writer = new ZipWriter(new Data64URIWriter("application/zip"));

    const steps = get(workflowState);
    const { nodes } = get(catalogState);
    // replace data URLs in step leafs with file path
    const { dataFiles, steps: externalSteps } = externalizeDataUrls(steps);
    // add data URL content to file in archive
    await Promise.all(
      Object.entries(dataFiles).map(([fn, dataURL]) =>
        writer.add(fn, new Data64URIReader(dataURL))
      )
    );

    const text = steps2tomltext(externalSteps, nodes);
    await writer.add("workflow.cfg", new TextReader(text));

    return await writer.close();
  },
});

export function useArchive() {
  return useRecoilValue<string>(archiveState);
}
