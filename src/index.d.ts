declare module 'react-native-web-jsonschema-form' {
  import React from 'react';

  export type JsonSchema =
    | RefJsonSchema
    | StringJsonSchema
    | NumberJsonSchema
    | ObjectJsonSchema
    | ArrayJsonSchema
    | BooleanJsonSchema
    | NullJsonSchema
    | EnumJsonSchema;

  export type JsonSchemaProperty =
    | RefJsonSchemaProperty
    | StringJsonSchemaProperty
    | NumberJsonSchemaProperty
    | ObjectJsonSchemaProperty
    | ArrayJsonSchemaProperty
    | BooleanJsonSchemaProperty
    | NullJsonSchemaProperty
    | EnumJsonSchemaProperty
    | AnyOfSchemaProperty
    | AllOfSchemaProperty
    | OneOfSchemaProperty;

  export type JsonPropertiesTypes =
    | 'string'
    | 'number'
    | 'object'
    | 'array'
    | 'boolean'
    | 'null';

  interface BaseJsonSchema {
    $schema?: string;
    $id?: string;
    title?: string;
    description?: string;
    required?: string[];
    [key: string]: any;
  }

  interface BaseJsonSchemaProperty {
    description?: string;
    [key: string]: any;
  }

  type AnyOfSchemaProperty = JsonSchemaProperty[];
  type AllOfSchemaProperty = JsonSchemaProperty[];
  type OneOfSchemaProperty = JsonSchemaProperty[];

  export interface RefJsonSchemaProperty extends BaseJsonSchemaProperty {
    $ref: string;
  }

  export interface StringJsonSchemaProperty extends BaseJsonSchemaProperty {
    type: 'string';
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?:
      | 'date-time'
      | 'time'
      | 'date'
      | 'email'
      | 'idn-email'
      | 'hostname'
      | 'idn-hostname'
      | 'ipv4'
      | 'ipv6'
      | 'uri'
      | 'uri-reference'
      | 'iri'
      | 'iri-reference'
      | 'uri-template'
      | 'json-pointer'
      | 'relative-json-pointer'
      | 'regex'
      | 'string'
      | 'data-url';
  }

  export interface NumberJsonSchemaProperty extends BaseJsonSchemaProperty {
    type: 'number';
    multipleOf?: number;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maximum?: number;
    exclusiveMaximum?: boolean;
  }

  export interface ObjectJsonSchemaProperty extends BaseJsonSchemaProperty {
    type: 'object';
    properties: {
      [key: string]: JsonSchemaProperty;
    };
    additionalProperties?: boolean;
    required?: string[];
    propertyNames?: {
      pattern?: string;
    };
    minProperties?: number;
    maxProperties?: number;
    dependencies?: {
      [key: string]: string[] | JsonSchemaProperty;
    };
    patternProperties?: {
      [key: string]: { type: JsonPropertiesTypes };
    };
  }

  export interface ArrayJsonSchemaProperty extends BaseJsonSchemaProperty {
    type: 'array';
    items: JsonSchemaProperty | JsonSchemaProperty[];
    contains?: JsonSchemaProperty;
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
  }

  export interface BooleanJsonSchemaProperty extends BaseJsonSchemaProperty {
    type: 'boolean';
  }

  export interface NullJsonSchemaProperty extends BaseJsonSchemaProperty {
    type: 'null';
  }

  export interface EnumJsonSchemaProperty extends BaseJsonSchema {
    type: 'enum';
    enum: string[];
  }

  export type RefJsonSchema = BaseJsonSchema & RefJsonSchemaProperty;
  export type StringJsonSchema = BaseJsonSchema & StringJsonSchemaProperty;
  export type NumberJsonSchema = BaseJsonSchema & NumberJsonSchemaProperty;
  export type ObjectJsonSchema = BaseJsonSchema & ObjectJsonSchemaProperty;
  export type ArrayJsonSchema = BaseJsonSchema & ArrayJsonSchemaProperty;
  export type BooleanJsonSchema = BaseJsonSchema & BooleanJsonSchemaProperty;
  export type NullJsonSchema = BaseJsonSchema & NullJsonSchemaProperty;
  export type EnumJsonSchema = BaseJsonSchema & EnumJsonSchemaProperty;

  type BaseFormData = Record<string, unknown>;
  export type UiSchema = Record<string, unknown>;
  type MetaSchema = Record<string, unknown>;
  type ErrorSchema = Record<string, unknown>;

  export class FormEvent {
    name: string;
    params: Record<string, unknown>;
    private prevented: boolean;

    constructor(name, params = {});

    preventDefault(): void;

    isDefaultPrevented(): boolean;
  }
  export interface FormChangeEvent<T extends BaseFormData> extends FormEvent {
    name: 'change';
    params: {
      metas: Record<string, unknown>;
      name: string;
      value: unknown;
      /**
       * Original values before the change.
       */
      values: T;
    };
  }

  export interface FormCancelEvent<T extends BaseFormData> extends FormEvent {
    name: 'cancel';
  }

  export interface FormSubmitEvent<T extends BaseFormData> extends FormEvent {
    name: 'submit';
    params: {
      values: T;
    };
  }

  interface JsonSchemaFormProps<T extends BaseFormData> {
    name?: string;
    schema?: JsonSchema;
    uiSchema?: UiSchema;
    metaSchema?: MetaSchema;
    errorSchema?: ErrorSchema;
    formData?: T;
    children?: ReactChild | ReactChild[];
    onRef?: () => {};
    onChange?: (event: FormChangeEvent<T>) => Promise<void>;
    onSubmit?: (event: FormSubmitEvent<T>) => Promise<void>;
    onCancel?: (event: FormCancelEvent<T>) => Promise<void>;
    onSuccess?: (event: FormEvent) => Promise<void>;
    onError?: (event: FormEvent) => Promise<void>;
    buttonPosition?: 'left' | 'right' | 'center';
    cancelButton?: bool | string;
    CancelButton?: React.Component | React.FunctionComponent;
    submitButton?: bool | string;
    SubmitButton?: React.Component | React.FunctionComponent;
    scroller?: Record<string, unknown>;
    widgets?: Record<string, (props: any) => JSX.Element>;
    filterEmptyValues?: boolean;
    insideClickRegex?: RegExp;
    // This is custom for app (not part of the Carelulu, remove this before final commit)
    HeadingComponent?: any;
  }

  declare class JsonSchemaForm<T extends BaseFormData> extends React.Component<
    JsonSchemaFormProps<T>,
    any
  > {}

  export default JsonSchemaForm;
}
