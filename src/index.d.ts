declare module "react-native-web-jsonschema-form" {
  export interface FormEvent {
    name: string;
    prevented: boolean;
  }
  export interface FormChangeEvent<T> extends FormEvent {
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
  export interface FormSubmitEvent<T> extends FormEvent {
    name: 'submit';
    params: {
      values: T;
    };
  }

  export declare function Form<T extends Record<string,unknown>>(props: {
    formData: T,
    schema: Record<string, unknown>,
    uiSchema: Record<string, unknown>,
    widgets: Record<string, (props:any) => JSX.Element>,
    HeadingComponent: (props:any) => JSX.Element,
    SubmitButton: (props:any) => JSX.Element,
    onChange: (event: FormChangeEvent<T>) => Promise<void>
    onSubmit: (event: FormSubmitEvent<T>) => Promise<void>
  }): JSX.Element;

  export default Form;

}
