import { JSONSchema7 } from "json-schema";
import { SchemaForm } from "./SchemaForm";
import { useState } from "react";

// From https://json-schema.org/learn/getting-started-step-by-step
const schema: JSONSchema7 = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Example Schema",
  description:
    "An example schema with properties of all types and combinations of annotations, enumerations",
  type: "object",
  properties: {
    stringProp: {
      type: "string",
    },
    stringTitleProp: {
      type: "string",
      title: "A string property with a title",
    },
    stringRequiredProp: {
      type: "string",
      description: "A required string property",
    },
    stringValidatedProp: {
      type: "string",
      description: "A string property with length and pattern validation",
      minLength: 3,
      maxLength: 10,
      pattern: "^[a-zA-Z]+$",
      default: 'valid'
    },
    stringDefaultProp: {
      type: "string",
      description: "A string property with a default value",
      default: "default value",
    },
    emailProp: {
      type: "string",
      format: "email",
      description: "An email property",
      default: 'someone@example.com'
    },
    uriProp: {
      type: "string",
      format: "uri",
      description: "A URI property",
      default: 'https://example.com'
    },
    numberProp: {
      type: "number",
    },
    numberTitleProp: {
      type: "number",
      title: "A number property with a title",
    },
    numberValidatedProp: {
      type: "number",
      description: "A number property",
      minimum: 0,
      maximum: 100,
      multipleOf: 10,
    },
    integerProp: {
      type: "integer",
      description: "An integer property",
    },
    booleanProp: {
      type: "boolean",
      description: "A boolean property",
    },
    arrayProp: {
      type: "array",
      description: "An array property",
      items: {
        type: "string",
      },
      minItems: 1,
      maxItems: 5,
      uniqueItems: true,
    },
    objectProp: {
      type: "object",
      description: "An object property",
      properties: {
        nestedStringProp: {
          type: "string",
          description: "A nested string property",
          default: 'nested'
        },
      },
      required: ["nestedStringProp"],
    },
    enumStringProp: {
      type: "string",
      description: "An enum string property",
      enum: ["option1", "option2", "option3"],
      default: 'option1'
    },
    // allOfProp: {
    //   allOf: [
    //     {
    //       type: "string",
    //       description: "A string property",
    //     },
    //     {
    //       minLength: 3,
    //       maxLength: 10,
    //       pattern: "^[a-zA-Z]+$",
    //     },
    //   ],
    // },
    // anyOfProp: {
    //   anyOf: [
    //     {
    //       type: "string",
    //       description: "A string property",
    //     },
    //     {
    //       type: "number",
    //       description: "A number property",
    //     },
    //   ],
    // },
    // oneOfProp: {
    //   oneOf: [
    //     {
    //       type: "string",
    //       description: "A string property",
    //     },
    //     {
    //       type: "number",
    //       description: "A number property",
    //     },
    //   ],
    // },
  },
  required: ["stringRequiredProp"],
};

function App() {
  const [isDirty, setIsDirty] = useState(false)
  return (
    <>
      <p className="text-3xl">
        Click on the Vite and React logos to learn more
      </p>
      <div className="p-5">
        <SchemaForm schema={schema} onSubmit={(values) => console.log(values)} 
        onDirtySwitch={(isDirty) => setIsDirty(isDirty)}
        />
      </div>
      <div>
        is dirty form: {isDirty ? 'true' : 'false'}
        {/* TODO can be used to ff you forget to press save button then you lose all your set values. It would be nice not to have a save button or when you leave a dirty form you are asked for confirmation to discard or save form values. */}
      </div>
    </>
  );
}

export default App;
