declare module "react-native-web-jsonschema-form" {
  type BaseFormData = Record<string, unknown>;
  type JsonSchema = Record<string, unknown>;
  type Uichema = Record<string, unknown>;
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
  export interface FormSubmitEvent<T extends BaseFormData> extends FormEvent {
    name: "submit";
    params: {
      values: T;
    };
  }

  export declare function Form<T extends BaseFormData>(props: {
    formData: T;
    schema: JsonSchema;
    uiSchema: UiSchema;
    widgets: Record<string, (props: any) => JSX.Element>;
    HeadingComponent: (props: any) => JSX.Element;
    SubmitButton: (props: any) => JSX.Element;
    onChange: (event: FormChangeEvent<T>) => Promise<void>;
    onSubmit: (event: FormSubmitEvent<T>) => Promise<void>;
  }): JSX.Element;

  export default Form;
}
