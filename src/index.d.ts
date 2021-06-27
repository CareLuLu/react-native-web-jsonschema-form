import { JsonSchema } from "type-jsonschema";
declare module "react-native-web-jsonschema-form" {
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
    name: "change";
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
    name: "cancel";
  }

  export interface FormSubmitEvent<T extends BaseFormData> extends FormEvent {
    name: "submit";
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
    onCancel?: (event: FormEvent) => Promise<void>;
    onSuccess?: (event: FormEvent) => Promise<void>;
    onError?: (event: FormEvent) => Promise<void>;
    buttonPosition?: "left" | "right" | "center";
    cancelButton?: bool | string;
    CancelButton?: React.Component | React.FunctionComponent;
    submitButton?: bool | string;
    SubmitButton?: React.Component | React.FunctionComponent;
    scroller?: Record<string, unknown>;
    widgets?: Record<string, (props: any) => JSX.Element>;
    filterEmptyValues?: boolean;
    insideClickRegex?: RegExp;
  }
  declare function JsonSchemaForm<T extends BaseFormData>(
    props: JsonSchemaFormProps<T>
  ): React.ReactElement<any, any>;

  // This does not work for some reason
  // declare class JsonSchemaForm<T extends BaseFormData> extends React.Component {
  //   constructor(props: JsonSchemaFormProps<T>);
  // }

  export default JsonSchemaForm;
}
