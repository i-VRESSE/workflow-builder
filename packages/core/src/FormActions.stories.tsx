import { useEffect } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FormActions } from "./FormActions";
import { Wrapper } from "./Wrapper";
import { useSetActiveSubmitButton, useWorkflow } from "./store";
import "bootstrap/dist/css/bootstrap.min.css";

const meta: ComponentMeta<typeof FormActions> = {
  component: FormActions,
  decorators: [
    (Story) => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
};
export default meta;

export const NothingSelected: ComponentStory<typeof FormActions> = () => {
  return <FormActions />;
};

export const GlobalParametersSelected: ComponentStory<typeof FormActions> =
  () => {
    const { toggleGlobalEdit } = useWorkflow();
    const submitFormRefSetter = useSetActiveSubmitButton();
    useEffect(toggleGlobalEdit, []);
    return (
      <>
        <button ref={submitFormRefSetter} style={{ display: "none" }} />
        <FormActions />
      </>
    );
  };

  export const NodeSelected: ComponentStory<typeof FormActions> =
  () => {
    const { selectNode } = useWorkflow();
    const submitFormRefSetter = useSetActiveSubmitButton();
    useEffect(() => {
        selectNode(0)
    }, []);
    return (
      <>
        <button ref={submitFormRefSetter} style={{ display: "none" }} />
        <FormActions />
      </>
    );
  };
