import { useFieldArray, useForm, useFormContext } from "react-hook-form";
// TODO find typescript type for JSON schema draft 2020-12
import { JSONSchema7 } from "json-schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Separator } from "./components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { fullFormats } from "ajv-formats/dist/formats";
import { ajvResolver } from "./ajvresolver";
import { FormCollapsible, FormGroup } from "./components/ui/FormGroup";
import { createContext, useContext, useEffect, useState } from "react";
import { Checkbox } from "./components/ui/checkbox";

interface SchemaFieldProps {
  schema: JSONSchema7;
  uiSchema?: Record<string, unknown>;
  name: string;
  required?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedUiSchema(path: string, uiSchema: any) {
  if (path === 'root' || uiSchema === undefined) {
    return uiSchema
  }
  const pathParts = path.split('.')
  let nestedUiSchema = uiSchema
  for (const pathPart of pathParts) {
    nestedUiSchema = nestedUiSchema[pathPart]
    if (nestedUiSchema === undefined) {
      return undefined
    }
  }
  return nestedUiSchema
}

function ObjectSchemaField({ schema, name }: SchemaFieldProps) {
  const { formElements, schema: rootUiSchema } = useContext(UiContext);
  if (schema.type !== "object" || schema.properties === undefined) {
    console.info('schema type is not object or has no properties, skipping it')
    return <></>
  }
  const required = schema.required ?? [];
  const uiSchema = getNestedUiSchema(name, rootUiSchema)

  // TODO support schema.dependentRequired
  // TODO render as <details> with <summary> in opened or closed state
  // TODO render as <fieldset> with <legend>

  const properties = Object.entries(schema.properties).map(
    ([propname, propschema]) => {
      if (typeof propschema === "boolean") {
        throw new Error("schema property is a boolean");
      }
      return (
        <SchemaField
          key={propname}
          schema={propschema}
          name={name === "root" ? propname : `${name}.${propname}`}
          required={required.includes(propname)}
        />
      );
    }
  );

  if (uiSchema && uiSchema['ui:field'] === 'collapsible') {
    return (
      <formElements.collapsible schema={schema} name={name} uiSchema={uiSchema}>
        <>
          {properties}
          {/* Show errors like required */}
          <formElements.field
            name={name}
            render={() => <formElements.message />}
          />
        </>
      </formElements.collapsible>
    );
  }
  return (
    <formElements.group schema={schema} name={name}>
      <>
        {properties}
        {/* Show errors like required */}
        <formElements.field
          name={name}
          render={() => <formElements.message />}
        />
      </>
    </formElements.group>
  );
}

function StringSelectEnumSchemaField({ schema, name }: SchemaFieldProps) {
  const { formElements } = useContext(UiContext);
  return (
    <formElements.scalar
      name={name}
      schema={schema}
      renderAsControl={true}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render={(field: any) => (
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <formElements.control>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          </formElements.control>
          <SelectContent>
            {schema.enum!.map((value) => {
              // TODO support enum with labels and values using oneOf
              return (
                <SelectItem key={value as string} value={value as string}>
                  {value as string}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}
    />
  );
}

/**
 * Store uploaded file in form data as a data-url with name parameter.
 */
function FileField({ schema, name }: SchemaFieldProps) {
  // TODO Support data-url format aka file upload
  // TODO add preview render function for like a thumbnail for images or ngl viewer for pdb files
  const { formElements } = useContext(UiContext);
  const { setValue, setError } = useFormContext();
  const [filename, setFilename] = useState("")

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) {
      return
    }
    const file = event.target.files[0]
    const reader = new FileReader();
    reader.onload = (e) => {
      // splice name into data url as parameter
      const body = e.target?.result?.toString().replace(`data:${file.type};base64,`, `data:${file.type};name=${file.name};base64,`)
      setValue(name, body, { shouldTouch:false})
      setFilename(file.name)
    };
    reader.onerror = (e) => {
      setError(name, {
        type: 'invalidFile',
        message: `invalid file: ${e}`
      })
    }
    reader.readAsDataURL(file);
  }

  return (
    <formElements.scalar
    name={name}
    schema={schema}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render={({ field }: {field: any}) => {
      return (
          <div>
        <formElements.input
          type="file"
          {...field}
          disabled={schema.readOnly ?? false}
          // Cannot let react-hook-form control set file input value as gives error that value must be string and be set programmatically
          value=""
          onChange={handleChange}
          accept={schema.contentMediaType}
        />
        {/* TODO find nicer way to show filename, input tag still has `no file chosen` text */}
        <span>{filename}</span>
        </div>
      )}
    }
    />
  );
}

function StringSchemaField({ schema, name }: SchemaFieldProps) {
  const { formElements } = useContext(UiContext);
  const placeholder = typeof schema.default === "string" ? schema.default : "";
  if (schema.enum !== undefined && Array.isArray(schema.enum)) {
    // TODO render as radio group
    return <StringSelectEnumSchemaField schema={schema} name={name} />;
  }
  if (schema.contentEncoding === 'base64') {
    return <FileField schema={schema} name={name} />;
  }

  let format = "text";
  const formatLookup: { [key: string]: string } = {
    text: "text",
    email: "email",
    uri: "url",
    // TODO browser built-in date picker does not return ISO8601 formatted string
    // use a custom date picker instead or custom setvalue function
    "date-time": "datetime-local",
    date: "date",
    time: "time",
  };
  if (schema.format !== undefined) {
    if (formatLookup[schema.format] !== undefined) {
      format = formatLookup[schema.format];
    } else {
      console.info(`unsupported schema format: ${schema.format}, using type=text`);
    }
  }

  return (
    <formElements.scalar
      name={name}
      schema={schema}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render={({ field }: {field: any}) => (
        <formElements.input
          type={format}
          placeholder={placeholder}
          {...field}
          disabled={schema.readOnly ?? false}
          value={field.value ?? ""}
        />
      )}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function defaultOfSchema(itemSchema: JSONSchema7): any {
  if (itemSchema.const !== undefined) {
    return itemSchema.const;
  }
  if (itemSchema.default !== undefined) {
    return itemSchema.default;
  }
  if (itemSchema.type === "object") {
    return {
      ...Object.fromEntries(
        Object.entries(itemSchema.properties ?? {})
          .filter((entry) => entry[1] !== false)
          .map(([key, value]) => [key, defaultOfSchema(value as JSONSchema7)])
          .filter((entry) => entry[1] !== undefined)
      ),
    };
  }
  if (itemSchema.type === "array") {
    // TODO support tuples
    // TODO support minItems aka return non-empty array
    return [];
  }
  if (itemSchema.type === "string") {
    return "";
  }
  if (itemSchema.type === "number" || itemSchema.type === "integer") {
    return 0;
  }
  if (itemSchema.type === "boolean") {
    return false;
  }
  return undefined;
}

function ArrayWrapperField({
  schema,
  name,
  children,
  actions,
}: SchemaFieldProps & {
  children: JSX.Element[];
  actions?: JSX.Element | JSX.Element[];
}) {
  const { formElements } = useContext(UiContext);

  return (
    <div>
      <h1>{schema.title ?? name}</h1>
      <p>{schema.description}</p>
      <Separator />
      <div>{children}</div>
      <div>{actions}</div>
      {/* Show errors like min/max/unique */}
      <formElements.field name={name} render={() => <formElements.message />} />
    </div>
  );
}

function ArraySchemaField({ schema, name }: SchemaFieldProps) {
  const { control } = useFormContext();
  const { formElements } = useContext(UiContext);
  const { fields, append, remove } = useFieldArray({
    name,
    control,
  });

  if (schema.items === undefined || typeof schema.items === "boolean") {
    throw new Error("schema items is undefined or false");
  }
  if (Array.isArray(schema.items)) {
    // TODO support tuple validation
    throw new Error("schema items is an array");
  }
  const itemSchema = schema.items;

  // TODO render as radio group when uniqueItems and items.enum is defined and items.type is string
  // TODO render as checkbox group when uniqueItems and items.type is boolean
  // TODO render as multi select when uniqueItems and items.type is string
  // TODO support prefixItems

  // TODO support re-ordering of items
  // TODO support for items.type=object to rendera as a table
  // TODO support no add/remove buttons
  // TODO extract classed things to component like FormGroup

  const arrayActions = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="mt-2"
      onClick={() => append(defaultOfSchema(itemSchema))}
    >
      Add
    </Button>
  );
  return (
    <formElements.arraywrap schema={schema} name={name} actions={arrayActions}>
      {fields.map((field, index) => (
        // TODO use component for array item
        <div key={field.id}>
          <SchemaField schema={itemSchema} name={`${name}.${index}`} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => remove(index)}
          >
            Remove
          </Button>
        </div>
      ))}
    </formElements.arraywrap>
  );
}

function NumberSchemaField({ schema, name }: SchemaFieldProps) {
  const { formElements } = useContext(UiContext);
  const placeholder = typeof schema.default === "string" ? schema.default : "";
  // TODO store input value as number instead of string
  // TODO? add validation to input component like minimum, maximum
  // to have validation before submitting form
  // could be hard to keep in sync with schema validation

  // TODO if schema.enum then render as select or radio group
  // TODO support render as slider
  return (
    <formElements.scalar
      name={name}
      schema={schema}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render={({ field }: {field: any}) => (
        <formElements.input
          type="number"
          placeholder={placeholder}
          {...field}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e:any) => field.onChange(parseFloat(e.target.value))}
          value={field.value.toString() ?? ""}
        />
      )}
    />
  );
}

function IntegerSchemaField({ schema, name }: SchemaFieldProps) {
  const { formElements } = useContext(UiContext);
  const placeholder = typeof schema.default === "string" ? schema.default : "";
  return (
    <formElements.scalar
      name={name}
      schema={schema}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render={({ field }: {field:any}) => (
        <formElements.input
          type="number"
          placeholder={placeholder}
          {...field}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => field.onChange(parseInt(e.target.value))}
          value={field.value.toString() ?? ""}
        />
      )}
    />
  );
}

function BooleanSchemaField({ schema, name }: SchemaFieldProps) {
  const { formElements } = useContext(UiContext);

  // TODO support rendering as 2 radios aka Yes / No
  // TODO support rendering as toggle
  // TODO more space between label and checkbox
  return (
    <formElements.scalar
      name={name}
      schema={schema}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render={({ field }:{field:any}) => (
        <formElements.checkbox
          checked={field.value ?? false}
          onCheckedChange={field.onChange}
          />
      )}
    />
  );
}

function ScalarSchemaField({
  schema,
  name,
  render,
  renderAsControl,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: SchemaFieldProps & { render: any; renderAsControl?: boolean }) {
  const { control } = useFormContext();
  const { formElements } = useContext(UiContext);

  return (
    <formElements.field
      name={name}
      control={control}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render={({ field }: {field:any}) => (
        <formElements.item>
          <formElements.label>
            {schema.title ?? name}
            {/* TODO add '*' if field is required */}
          </formElements.label>
          {renderAsControl ? (
            render(field)
          ) : (
            <formElements.control>{render({ field })}</formElements.control>
          )}
          <formElements.description>
            {schema.description}
            {/* TODO add tooltip with $comment if present */}
            {/* TODO add link to documentation if present */}
            {/* TODO render examples if present */}
          </formElements.description>
          <formElements.message />
        </formElements.item>
      )}
    />
  );
}

function SchemaField({ schema, name, required }: SchemaFieldProps) {
  const { widgets } = useContext(UiContext);
  const type = schema.type;
  if (type === undefined) {
    if (schema.oneOf !== undefined) {
      return <div>TODO</div>;
    } else if (schema.anyOf !== undefined) {
      return <div>TODO</div>;
    } else if (schema.allOf !== undefined) {
      return <div>TODO</div>;
    } else if (schema.not !== undefined) {
      return <div>TODO</div>;
    } else {
      throw new Error("schema has no type or logical subschema");
    }
  }
  if (type === "null") {
    throw new Error("schema type is null");
  }
  if (Array.isArray(type)) {
    throw new Error("schema type is an array");
  }

  // TODO support schema.oneOf
  // TODO support schema.anyOf
  // TODO support schema.allOf
  // TODO support schema.dependentSchemas
  // TODO support shema.[if+then+else]
  // TODO support const aka hidden field

  const Component = widgets[type];
  if (!Component) {
    throw new Error(`unsupported schema type: ${type}`);
  }

  // TODO show whether field is required in label
  return <Component schema={schema} name={name} required={required ?? false} />;
}

interface Props {
  schema: JSONSchema7;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (values: any) => void;
  values?: Record<string, unknown>;
  onDirtySwitch?: (isDirty: boolean) => void;
  ui?: {
    schema?: Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formElements?: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields?: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    widgets?: Record<string, any>;
  };
}

const defaultFormElements = {
  group: FormGroup,
  field: FormField,
  item: FormItem,
  label: FormLabel,
  description: FormDescription,
  message: FormMessage,
  input: Input,
  checkbox: Checkbox,
  control: FormControl,
  arraywrap: ArrayWrapperField,
  scalar: ScalarSchemaField,
  collapsible: FormCollapsible,
};

const defaultFields = {
  select: StringSelectEnumSchemaField,
  checkbox: BooleanSchemaField,
};

// allow to override component lookup via property,
// to style components
const defaultWidgets = {
  object: ObjectSchemaField,
  string: StringSchemaField,
  array: ArraySchemaField,
  number: NumberSchemaField,
  integer: IntegerSchemaField,
  boolean: BooleanSchemaField,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UiContext = createContext<any>({
  schema: {},
  formElements: defaultFormElements,
  fields: defaultFields,
  widgets: defaultWidgets,
});

export function SchemaForm({
  schema,
  onSubmit,
  onDirtySwitch,
  ui,
  values,
}: Props) {
  // TODO uiSchema to provide custom widgets
  // TODO support radio group widget
  // TODO support textarea widget
  // TODO expose whether form is dirty aka different from defaults

  const uiValue = {
    schema: ui?.schema,
    formElements: {
      ...defaultFormElements,
      ...ui?.formElements,
    },
    fields: {
      ...defaultFields,
      ...ui?.fields,
    },
    widgets: {
      ...defaultWidgets,
      ...ui?.widgets,
    },
  };
  const defaultValues = defaultOfSchema(schema);
  const form = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: ajvResolver(schema as any, {
      formats: fullFormats,
    }),
    defaultValues,
    values,
  });

  useEffect(() => {
    if (onDirtySwitch === undefined) {
      return;
    }
    onDirtySwitch(form.formState.isDirty);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState.isDirty]);

  return (
    <UiContext.Provider value={uiValue}>
      <Form {...form}>
        {/* TODO expose form.className as prop */}
        <form
          // TODO remove values from formdata that are equal to default value of field in schema
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.log("onSubmitError", errors);
          })}
          className="space-y-8"
        >
          {/* TODO stop root field from appearing in submitted values */}
          <SchemaField schema={schema} name="root" />
          {/* TODO add reset button */}
          {/* TODO allow label of submit button to be overridden */}
          {/* TODO allow submit with external button */}
          {/* TODO disable buttons while submitting */}
          <Button type="submit">Submit</Button>
          <Button
            type="reset"
            variant="outline"
            onClick={() => form.reset(defaultValues)}
          >
            Reset
          </Button>
        </form>
      </Form>
    </UiContext.Provider>
  );
}
