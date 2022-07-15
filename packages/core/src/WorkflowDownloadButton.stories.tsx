import React, { useEffect } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { WorkflowDownloadButton } from "./WorkflowDownloadButton";
import { Wrapper } from "./Wrapper";
import { useGlobalFormData, useSetCatalog } from "./store";
import { prepareCatalog } from "./catalog";
import "bootstrap/dist/css/bootstrap.min.css";

const meta: ComponentMeta<typeof WorkflowDownloadButton> = {
  component: WorkflowDownloadButton,
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
};
export default meta;

export const EmptyWorkflow: ComponentStory<typeof WorkflowDownloadButton> =
  () => {
    return <WorkflowDownloadButton />;
  };

export const FilledWorkflowWithString: ComponentStory<
  typeof WorkflowDownloadButton
> = () => {
  const setCatalog = useSetCatalog();
  const setGlobalFormData = useGlobalFormData()[1];
  useEffect(() => {
    const catalog = prepareCatalog({
      title: "Some title",
      categories: [],
      global: {
        schema: {
          type: "object",
          properties: {
            parameter1: {
              type: "string",
            },
          },
          additionalProperties: false,
        },
        uiSchema: {},
      },
      nodes: [],
      examples: {},
    });
    setCatalog(catalog);
    setGlobalFormData({ parameter1: "some value" });
  }, []);
  return <WorkflowDownloadButton />;
};

export const FilledWorkflowWithFile: ComponentStory<
  typeof WorkflowDownloadButton
> = () => {
  const setCatalog = useSetCatalog();
  const setGlobalFormData = useGlobalFormData()[1];
  useEffect(() => {
    const catalog = prepareCatalog({
      title: "Some title",
      categories: [],
      global: {
        schema: {
          type: "object",
          properties: {
            parameter1: {
              type: "string",
              format: "uri-reference",
            },
          },
          additionalProperties: false,
        },
        uiSchema: {},
      },
      nodes: [],
      examples: {},
    });
    setCatalog(catalog);
    const parameter1 =
      "data:text/plain;name=foobar.txt;base64," + btoa("Some content");
    setGlobalFormData({ parameter1 });
  }, []);
  return <WorkflowDownloadButton />;
};
