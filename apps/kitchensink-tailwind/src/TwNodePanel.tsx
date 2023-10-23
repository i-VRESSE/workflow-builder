import { FormProps } from "@i-vresse/wb-core/dist/FormProps";
import { SchemaForm } from "@i-vresse/wb-tailwind-form";
import {
  useCatalog,
  useGlobalFormData,
  useSelectNodeIndex,
  useSelectedCatalogNode,
  useSelectedNode,
  useSelectedNodeFormData,
  useSelectedNodeFormSchema,
  useSelectedNodeFormUiSchema,
  useWorkflow,
} from "@i-vresse/wb-core/dist/store";

const GlobalForm = ({ fields, widgets }: FormProps): JSX.Element => {
  const { global: globalSchemas } = useCatalog();
  const [formData, setFormData] = useGlobalFormData();
  const uiSchema = globalSchemas.formUiSchema;
  const ui = {
    schema: uiSchema,
    fields,
    widgets
  }
  return (
    <SchemaForm
      schema={globalSchemas.formSchema ?? {type:'object'}}
      values={formData}
      ui={ui}
      onSubmit={(formData) => setFormData(formData)}
    />
  );
};

const NodeForm = ({ fields, widgets }: FormProps): JSX.Element => {
  const [formData, setFormData] = useSelectedNodeFormData();
  const node = useSelectedNode();
  const catalogNode = useSelectedCatalogNode();
  const schema = useSelectedNodeFormSchema() ?? {};
  const uiSchema = useSelectedNodeFormUiSchema() ?? {};
  const ui = {
    schema: uiSchema,
    fields,
    widgets
  }
  if (node === undefined) {
    return <div>No node selected</div>;
  }
  if (catalogNode === undefined) {
    return <div>Unable to find schema belonging to node</div>;
  }
  return (
    <>
      <h4>
        {catalogNode.label} ({node.type})
      </h4>
      <div style={{ marginBottom: "20px" }}>{catalogNode.description}</div>
      <SchemaForm
        schema={schema}
        values={formData}
        ui={ui}
        onSubmit={(formData) => setFormData(formData)}
      />
    </>
  );
};

/**
 * Panel which renders the form for the selected node or the global parameters.
 *
 */
export const TwNodePanel = ({ fields, widgets }: FormProps): JSX.Element => {
  const selectedNodeIndex = useSelectNodeIndex();
  const { editingGlobal } = useWorkflow();
  let form = (
    <div>No node or global parameters selected for configuration.</div>
  );
  let legend = "Node";
  if (editingGlobal) {
    form = <GlobalForm fields={fields} widgets={widgets} />;
    legend = "Global parameters";
  }
  if (selectedNodeIndex !== -1) {
    form = <NodeForm fields={fields} widgets={widgets} />;
  }
  return (
    <fieldset>
      <legend>{legend}</legend>
      {form}
    </fieldset>
  );
};
