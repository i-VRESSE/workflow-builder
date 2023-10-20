import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { Resolver } from '@hookform/resolvers/ajv';
import type { DefinedError } from 'ajv';
import Ajv from "ajv/dist/2020"
import ajvErrors from 'ajv-errors';
import { appendErrors, FieldError } from 'react-hook-form';

const parseErrorSchema = (
    ajvErrors: DefinedError[],
    validateAllFieldCriteria: boolean,
  ) => {
    // Ajv will return empty instancePath when require error
    ajvErrors.forEach((error) => {
      if (error.keyword === 'required') {
        error.instancePath += '/' + error.params.missingProperty;
      }
    });
  
    return ajvErrors.reduce<Record<string, FieldError>>((previous, error) => {
      // `/deepObject/data` -> `deepObject.data`
      const path = error.instancePath.substring(1).replace(/\//g, '.');
  
      if (!previous[path]) {
        previous[path] = {
          message: error.message,
          type: error.keyword,
        };
      }
  
      if (validateAllFieldCriteria) {
        const types = previous[path].types;
        const messages = types && types[error.keyword];
  
        previous[path] = appendErrors(
          path,
          validateAllFieldCriteria,
          previous,
          error.keyword,
          messages
            ? ([] as string[]).concat(messages as string[], error.message || '')
            : error.message,
        ) as FieldError;
      }
  
      return previous;
    }, {});
  };
  
  export const ajvResolver: Resolver =
    (schema, schemaOptions, resolverOptions = {}) =>
    async (values, _, options) => {
      const ajv = new Ajv(
        Object.assign(
          {},
          {
            allErrors: true,
            validateSchema: true,
          } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          schemaOptions,
        ),
      );
  
      if (ajvErrors && ajvErrors.default !== undefined) {
        ajvErrors.default(ajv);  
      } else {
        ajvErrors(ajv);
      }
  
      const validate = ajv.compile(
        Object.assign(
          { $async: resolverOptions && resolverOptions.mode === 'async' },
          schema,
        ),
      );
  
      const valid = validate(values);
  
      options.shouldUseNativeValidation && validateFieldsNatively({}, options);
  
      return valid
        ? { values, errors: {} }
        : {
            values: {},
            errors: toNestErrors(
              parseErrorSchema(
                validate.errors as DefinedError[],
                !options.shouldUseNativeValidation &&
                  options.criteriaMode === 'all',
              ),
              options,
            ),
          };
    };