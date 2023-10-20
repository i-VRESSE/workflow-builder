import { useFieldArray, useForm, useFormContext } from "react-hook-form";
// TODO find typescript type for JSON schema draft 2020-12
import { JSONSchema7,  } from "json-schema";
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
import { FormGroup } from "./components/ui/FormGroup";
import { useEffect } from "react";


interface SchemaFieldProps {
  schema: JSONSchema7;
  name: string;
  required?: boolean;
}

function ObjectSchemaField({ schema, name }: SchemaFieldProps) {
  if (schema.type !== "object" || schema.properties === undefined) {
    throw new Error("schema type is not object or has no properties");
  }
  const required = schema.required ?? [];

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
  return (
    <FormGroup schema={schema} name={name}>
      {properties}
    </FormGroup>
  );
}

function StringSelectEnumSchemaField({ schema, name }: SchemaFieldProps) {
  const { control } = useFormContext();
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{schema.title ?? name}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
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
          <FormDescription>{schema.description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function StringSchemaField({ schema, name }: SchemaFieldProps) {
  const { control } = useFormContext();
  const placeholder = typeof schema.default === "string" ? schema.default : "";
  if (schema.enum !== undefined && Array.isArray(schema.enum)) {
    // TODO render as radio group
    return <StringSelectEnumSchemaField schema={schema} name={name} />;
  }

  let format = "text";
  const formatLookup: { [key: string]: string } = {
    text: "text",
    email: "email",
    uri: "url",
    "date-time": "datetime-local",
    date: "date",
    time: "time",
  };
  if (schema.format !== undefined) {
    if (formatLookup[schema.format] !== undefined) {
      format = formatLookup[schema.format];
    } else {
      throw new Error(`unsupported schema format: ${schema.format}`);
    }
  }
  // TODO Support data-url format aka file upload
  // TODO Support contentMediaType
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{schema.title ?? name}</FormLabel>
          <FormControl>
            <Input
              type={format}
              placeholder={placeholder}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormDescription>{schema.description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function defaultOfSchema(itemSchema: JSONSchema7): any { // eslint-disable-line @typescript-eslint/no-explicit-any
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

function ArraySchemaField({ schema, name }: SchemaFieldProps) {
  const { control } = useFormContext();
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
  return (
    <div>
      <h1>{schema.title ?? name}</h1>
      <p>{schema.description}</p>
      <Separator />
      <div>
        {fields.map((field, index) => (
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
      </div>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => append(defaultOfSchema(itemSchema))}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

function NumberSchemaField({ schema, name }: SchemaFieldProps) {
  const { control } = useFormContext();
  const placeholder = typeof schema.default === "string" ? schema.default : "";
  // TODO store input value as number instead of string
  // TODO? add validation to input component like minimum, maximum
  // to have validation before submitting form
  // could be hard to keep in sync with schema validation

  // TODO if schema.enum then render as select or radio group
  // TODO support render as slider
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{schema.title ?? name}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={placeholder}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormDescription>{schema.description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function IntegerSchemaField({ schema, name }: SchemaFieldProps) {
  const { control } = useFormContext();
  const placeholder = typeof schema.default === "string" ? schema.default : "";
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{schema.title ?? name}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={placeholder}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormDescription>{schema.description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function BooleanSchemaField({ schema, name }: SchemaFieldProps) {
  const { control } = useFormContext();

  // TODO support rendering as 2 radios

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{schema.title ?? name}</FormLabel>
          <FormControl>
            <Input type="checkbox" {...field} value={field.value ?? ""} />
          </FormControl>
          <FormDescription>{schema.description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function SchemaField({ schema, name, required }: SchemaFieldProps) {
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

  // TODO allow to override component lookup via property,
  // to style components
  const componentLookup = {
    object: ObjectSchemaField,
    string: StringSchemaField,
    array: ArraySchemaField,
    number: NumberSchemaField,
    integer: IntegerSchemaField,
    boolean: BooleanSchemaField,
  };

  const Component = componentLookup[type];
  if (!Component) {
    throw new Error(`unsupported schema type: ${type}`);
  }

  // TODO show whether field is required in label
  return <Component schema={schema} name={name} required={required ?? false} />;
}

interface Props {
  schema: JSONSchema7;
  onSubmit: (values: unknown) => void;
  onDirtySwitch: (isDirty: boolean) => void;
}

export function SchemaForm({ schema, onSubmit, onDirtySwitch }: Props) {
  // TODO uiSchema to provide custom widgets
  // TODO support radio group widget
  // TODO support textarea widget
  // TODO expose whether form is dirty aka different from defaults

  const defaultValues = defaultOfSchema(schema);
  const form = useForm({
    resolver: ajvResolver(schema as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
      formats: fullFormats,
    }),
    defaultValues,
  });


  useEffect(() => {
    onDirtySwitch(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtySwitch]);  

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <SchemaField schema={schema} name="root" />
        {/* TODO add reset button */}
        {/* TODO allow label of submit button to be overridden */}
        {/* TODO allow submit with external button */}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
