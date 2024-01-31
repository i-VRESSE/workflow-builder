import { action } from "@ladle/react";
import { SchemaForm } from "./SchemaForm";
import { JSONSchema7 } from "json-schema";
import "./index.css";

export const Types = () => {
  const schema: JSONSchema7 = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      stringProp: {
        type: "string",
      },
      numberProp: {
        type: "number",
      },
      integerProp: {
        type: "integer",
      },
      booleanProp: {
        type: "boolean",
      },
      arrayOfScalarProp: {
        type: "array",
        items: {
          type: "string",
        },
      },
      objectProp: {
        type: "object",
        properties: {
          nestedStringProp: {
            type: "string",
          },
        },
      },
    },
  };
  return <SchemaForm schema={schema} onSubmit={action("onSubmit")} />;
};

export const Formats = () => {
  const schema: JSONSchema7 = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      emailProp: {
        type: "string",
        format: "email",
        description: "An email property",
        default: "me@example.com",
      },
      uriProp: {
        type: "string",
        format: "uri",
        description: "A URI property",
        default: "https://example.com",
      },
      dateTimeProp: {
        type: "string",
        format: "date-time",
        description: "A date-time property",
        default: "2018-06-12T19:30",
      },
      dateProp: {
        type: "string",
        format: "date",
        description: "A date property",
        default: "2021-01-01",
      },
      timeProp: {
        type: "string",
        format: "time",
        description: "A time property",
        default: "13:12:00",
      },
      uriRefProp: {
        type: "string",
        format: "uri-reference",
        description: "A URI reference property",
        default: "somedir",
      },
    },
  };
  return <SchemaForm schema={schema} onSubmit={action("onSubmit")} />;
};

export const Comments = () => {
  const schema: JSONSchema7 = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    title: "A title",
    description: "A description",
    properties: {
      titleProp: {
        type: "string",
        title: "A string with a title",
      },
      descriptionProp: {
        type: "string",
        description: "A string property with a description",
      },
      commentProp: {
        type: "string",
        $comment: "This is a comment",
      },
      readOnlyProp: {
        type: "string",
        readOnly: true,
        default: "read-only",
      },
      examplesProp: {
        type: "string",
        default: "exampple0",
        examples: ["example1", "example2"],
      },
    },
  };
  return <SchemaForm schema={schema} onSubmit={action("onSubmit")} />;
};

export const Enums = () => {
  const schema: JSONSchema7 = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      enumStringProp: {
        type: "string",
        description: "An enum string property",
        enum: ["option1", "option2", "option3"],
        default: "option1",
      },
    },
  };
  return <SchemaForm schema={schema} onSubmit={action("onSubmit")} />;
};

export const ValidationErrors = () => {
  const schema: JSONSchema7 = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    description: "Change default value to see validation errors",
    properties: {
      stringProp: {
        type: "string",
        description: "A string property with length and pattern validation",
        minLength: 3,
        maxLength: 10,
        pattern: "^[a-zA-Z]+$",
        default: "valid",
      },
      stringRequiredProp: {
        type: "string",
        description: "A required string property",
      },
      arrayValidatedProp: {
        type: "array",
        description: "An array property with length validation",
        items: {
          type: "string",
        },
        minItems: 2,
        maxItems: 3,
        default: ["one", "two"],
      },
      numberMinMaxProp: {
        type: "number",
        description: "A number property between 3 and 10",
        minimum: 3,
        maximum: 10,
        default: 4.2,
      },
      integerMinMaxProp: {
        type: "integer",
        description: "A integer property between 3 and 10",
        minimum: 3,
        maximum: 10,
        default: 5,
      },
    },
    required: ["stringRequiredProp"],
  };
  return <SchemaForm schema={schema} onSubmit={action("onSubmit")} />;
};

export const Dirtyness = () => {
  const schema: JSONSchema7 = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      stringProp: {
        type: "string",
        description: "Changing me makes the form dirty",
        default: "valid",
      },
    },
  };
  return (
    <SchemaForm
      schema={schema}
      onSubmit={action("onSubmit")}
      onDirtySwitch={action("onDirtySwitch")}
    />
  );
};

export const Files = () => {
  const schema: JSONSchema7 = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      // rjsf way of doing it,
      // needs uiSchema with {'ui:widget': 'file',accept: '.pdf'}
      // dataUrlProp: {
      //     type: "string",
      //     format: "data-url",
      //   },
      // dataUrlsProp: {
      //     type: "array",
      //     items: {
      //       type: "string",
      //       format: "data-url",
      //     },
      //   },
      // draft 2020-12 way of doing it
      fileProp: {
        type: "string",
        contentEncoding: "base64",
      },
      fileWithPngMimeProp: {
        type: "string",
        contentEncoding: "base64",
        contentMediaType: "image/png",
      },
      // TODO use single input tag for multiple files
      filesProp: {
        type: "array",
        items: {
          type: "string",
          contentEncoding: "base64",
        },
      },
    },
  };
  return <SchemaForm schema={schema} onSubmit={action("onSubmit")} />;
};

export const CustomLabel = () => {
  const schema: JSONSchema7 = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      stringProp: {
        type: "string",
      },
    },
  };
  const ui = {
    formElements: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      label: (props: any) => {
        return <label className="text-green-500" {...props} />;
      },
    },
  };

  return <SchemaForm schema={schema} onSubmit={action("onSubmit")} ui={ui} />;
};

export const Collapsible = () => {
  const schema: JSONSchema7 = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      objectProp: {
        type: "object",
        properties: {
          nestedStringProp: {
            type: "string",
          },
        },
      },
      expandedObjectProp: {
        type: "object",
        properties: {
          nestedStringProp: {
            type: "string",
          },
        },
      },
    },
  };
  const ui = {
    schema: {
      objectProp: {
        "ui:field": "collapsible",
      },
      expandedObjectProp: {
        "ui:field": "collapsible",
        "ui:open": true,
      },
    },
  }
  return <SchemaForm schema={schema} ui={ui} onSubmit={action("onSubmit")} />;
};
