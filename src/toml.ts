import { Section, stringify, inline, parse } from "@ltd/j-toml";
import { IStep, INode } from "./types";

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

export function steps2tomltext(steps: IStep[], nodes: INode[]) {
  const table = steps2tomltable(steps, nodes);
  const text = stringify(table as any, {
    newline: "\n",
    integer: Number.MAX_SAFE_INTEGER,
  });
  return text;
}

export function parseWorkflow(workflow: string) {
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
