import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import PropTypes from 'prop-types';
import {
  get,
  set,
  noop,
  each,
  cloneDeep,
  isString,
  isArray,
  isError,
  isPlainObject,
} from 'lodash';
import isEqual from 'fast-deep-equal';
import Row from 'react-native-web-ui-components/Row';
import { withTheme } from 'react-native-web-ui-components/Theme';
import FormEvent from './FormEvent';
import DefaultCancelButton from './CancelButton';
import DefaultSubmitButton from './SubmitButton';
import fields from './fields';
import defaultWidgets from './widgets';
import {
  merge,
  expand,
  toPath,
  isField,
  normalized,
  getMeta,
  getValues,
  getErrors,
  getRequired,
  getStructure,
  getExceptions,
} from './utils';

export {
  FIELD_KEY,
  FIELD_NAME,
  FIELD_VALUE,
  FIELD_TITLE,
} from './utils';

const styles = StyleSheet.create({
  form: { zIndex: 1 },
  buttonContainer: {
    paddingTop: 5,
  },
  buttonContainerCenter: {
    justifyContent: 'center',
  },
  buttonContainerLeft: {
    justifyContent: 'flex-start',
  },
  buttonContainerRight: {
    justifyContent: 'flex-end',
  },
});


const defaultReject = (err) => { throw err; };

const getButtonPosition = (position) => {
  const style = [styles.buttonContainer];
  if (position === 'center') {
    style.push(styles.buttonContainerCenter);
  } else if (position === 'left') {
    style.push(styles.buttonContainerLeft);
  } else {
    style.push(styles.buttonContainerRight);
  }
  return style;
};

const addToObject = obj => (v, k) => Object.assign(obj, { [k]: v });

const addToArray = arr => v => arr.push(v);

class Form extends React.Component {
  static propTypes = {
    theme: PropTypes.shape().isRequired,
    name: PropTypes.string,
    formData: PropTypes.shape(),
    schema: PropTypes.shape(),
    uiSchema: PropTypes.shape(),
    metaSchema: PropTypes.shape(),
    errorSchema: PropTypes.shape(),
    children: PropTypes.node,
    onRef: PropTypes.func,
    onFocus: PropTypes.func,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    onSuccess: PropTypes.func,
    onError: PropTypes.func,
    buttonPosition: PropTypes.oneOf(['left', 'right', 'center']),
    cancelButton: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    CancelButton: PropTypes.elementType,
    submitButton: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    SubmitButton: PropTypes.elementType,
    scroller: PropTypes.shape(),
    widgets: PropTypes.arrayOf(PropTypes.elementType),
    filterEmptyValues: PropTypes.bool,
  };

  static defaultProps = {
    name: null,
    formData: {},
    schema: {
      type: 'object',
      properties: [],
    },
    uiSchema: {},
    metaSchema: undefined,
    errorSchema: {},
    children: null,
    onRef: noop,
    onFocus: noop,
    onChange: noop,
    onSubmit: noop,
    onCancel: noop,
    onSuccess: noop,
    onError: noop,
    buttonPosition: 'right',
    cancelButton: true,
    CancelButton: DefaultCancelButton,
    submitButton: true,
    SubmitButton: DefaultSubmitButton,
    scroller: null,
    widgets: [],
    filterEmptyValues: false,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    let state = null;

    // If schema or uiSchema changes, we recalculate everything.
    if (
      !isEqual(nextProps.schema, prevState.schemaProp)
      || !isEqual(nextProps.uiSchema, prevState.uiSchemaProp)
    ) {
      const { schema, uiSchema } = getStructure(nextProps.schema, nextProps.uiSchema);
      const formDataProp = getValues(nextProps.formData, schema);
      const values = merge(prevState.values, formDataProp);
      state = {
        schema,
        uiSchema,
        formDataProp,
        clearCache: true,
        event: 'rebuild:schema',
        required: getRequired(schema),
        schemaProp: nextProps.schema,
        uiSchemaProp: nextProps.uiSchema,
        errorSchemaProp: nextProps.errorSchema,
        metaSchemaProp: nextProps.metaSchema,
        values: cloneDeep(values),
        errors: cloneDeep(getErrors(nextProps.errorSchema, schema)),
        meta: cloneDeep(getMeta(nextProps.metaSchema || values, schema)),
      };
    } else {
      const {
        schema,
        values,
        formDataProp,
        errorSchemaProp,
        metaSchemaProp,
      } = prevState;

      // If the relevant attributes of formData changes, we recalculate values.
      const nextFormDataProp = getValues(nextProps.formData, schema);
      if (!isEqual(formDataProp, nextFormDataProp)) {
        state = {
          clearCache: true,
          event: 'rebuild:form-data',
          values: cloneDeep(merge(values, nextFormDataProp)),
          formDataProp: nextFormDataProp,
        };
      }

      // If the errorSchema changes, we reset the errorSchema.
      if (!isEqual(nextProps.errorSchema, errorSchemaProp)) {
        state = Object.assign(state || {}, {
          event: 'rebuild:errors',
          errorSchemaProp: nextProps.errorSchema,
          errors: cloneDeep(getErrors(nextProps.errorSchema, schema)),
        });
      }

      // If the metaSchema changes, we reset the metaSchema.
      if (!isEqual(nextProps.metaSchemaProp, metaSchemaProp)) {
        state = Object.assign(state || {}, {
          event: 'rebuild:meta',
          metaSchemaProp: nextProps.metaSchema,
          meta: cloneDeep(getMeta(nextProps.metaSchema || values, schema)),
        });
      }
    }
    return state;
  }

  constructor(props) {
    super(props);
    const {
      name,
      onRef,
      schema,
      uiSchema,
      formData,
      widgets,
      errorSchema,
      metaSchema,
    } = props;
    this.id = `Form__${name || Math.random().toString(36).substr(2, 9)}`;
    this.fieldRegex = new RegExp(`${this.id}-field`);
    this.mountSteps = [];
    this.widgets = Object.assign({}, defaultWidgets, widgets);
    const structure = getStructure(schema, uiSchema);
    const formDataProp = getValues(formData, structure.schema);
    this.state = {
      formDataProp,
      focus: '',
      update: {},
      event: 'build',
      clearCache: false,
      required: getRequired(structure.schema),
      schema: structure.schema,
      uiSchema: structure.uiSchema,
      schemaProp: schema,
      uiSchemaProp: uiSchema,
      errorSchemaProp: errorSchema,
      metaSchemaProp: metaSchema,
      values: cloneDeep(formDataProp),
      errors: cloneDeep(getErrors(errorSchema, structure.schema)),
      meta: cloneDeep(getMeta(metaSchema || formDataProp, structure.schema)),
    };
    onRef(this);
  }

  componentDidMount() {
    if (Platform.OS === 'web') {
      window.addEventListener('click', this.clickListener);
    }
    this.mounted = true;
    this.onMount();
  }

  componentWillUnmount() {
    this.mounted = false;
    if (Platform.OS === 'web') {
      window.removeEventListener('click', this.clickListener);
    }
  }

  onMount = (handler) => {
    if (handler) {
      this.mountSteps.push(handler);
    }
    if (this.mounted) {
      const fn = this.mountSteps.shift();
      if (fn) {
        fn.call(this);
      }
    }
  };

  onFocus = (name = '', update) => {
    const { focus } = this.state;
    if (name === '' || focus !== name) {
      const { onFocus, scroller } = this.props;
      const event = new FormEvent('focus', {
        name,
        update: update || [focus, name],
      });
      this.run(onFocus(event), () => {
        if (event.allowed()) {
          if (scroller) {
            scroller.setNativeProps({ scrollEnabled: true });
          }
          this.onMount(() => this.setState({
            event: event.name,
            focus: event.params.name,
            update: expand(event.params.update),
          }));
        }
      });
    }
  };

  onChange = (value, name, params = {}) => {
    const {
      silent = false,
      overwrittenFocus,
      update = [],
      nextErrors = false,
      nextMeta = false,
    } = params;
    const {
      focus,
      meta,
      values,
      errors,
    } = this.state;
    const { onChange } = this.props;
    let nextFocus = overwrittenFocus || name;
    if (silent) {
      nextFocus = focus;
    }
    const event = new FormEvent('change', {
      name,
      value,
      silent,
      values,
      nextMeta,
      nextErrors,
      focus: nextFocus,
      update: [nextFocus, name].concat(update),
    });
    this.run(onChange(event), () => {
      if (event.allowed()) {
        const path = toPath(event.params.name);
        set(event.params.values, path, event.params.value);
        if (event.params.nextMeta !== false) {
          set(meta, path, event.params.nextMeta);
        }
        if (event.params.nextErrors !== false) {
          set(errors, path, event.params.nextErrors);
        }
        const error = get(errors, path);
        if (error) {
          if (normalized(error.lastValue) !== normalized(event.params.value)) {
            error.hidden = true;
          } else {
            error.hidden = false;
          }
        }
        this.onMount(() => this.setState({
          meta: { ...meta },
          errors: { ...errors },
          event: event.name,
          values: { ...event.params.values },
          focus: event.params.focus,
          update: expand(event.params.update),
        }));
      }
    });
  };

  onCancel = () => {
    const { values } = this.state;
    const { onCancel } = this.props;
    const event = new FormEvent('cancel', { values });
    this.run(onCancel(event));
  };

  onSubmit = () => {
    let { values } = this.state;
    const { onSubmit, filterEmptyValues } = this.props;
    if (filterEmptyValues) {
      values = this.filterEmpty(values);
    }

    const event = new FormEvent('submit', { values });
    this.run(onSubmit(event), (response) => {
      if (event.allowed()) {
        this.onSuccess(response);
      }
    }, (errorSchema) => {
      if (event.allowed()) {
        this.onError(errorSchema);
      }
    });
  };

  onSuccess = (response) => {
    const { schema, values } = this.state;
    const { onSuccess } = this.props;
    const event = new FormEvent('success', {
      values,
      response,
      update: 'all',
    });
    this.run(onSuccess(event), () => {
      if (event.allowed()) {
        this.onMount(() => this.setState({
          event: event.name,
          errors: getErrors({}, schema),
          values: event.params.values,
          update: expand(event.params.update),
        }));
      }
    });
  };

  onError = (err) => {
    const { schema } = this.state;
    const { onError } = this.props;
    let errorSchema = err;
    if (isError(errorSchema)) {
      errorSchema = { Error: err.message };
    }
    const errors = getErrors(errorSchema || {}, schema);
    const exceptions = getExceptions(errorSchema, errors);
    const event = new FormEvent('error', {
      errors,
      exceptions,
      update: 'all',
    });
    this.run(onError(event), () => {
      if (event.allowed()) {
        this.onMount(() => this.setState({
          event: event.name,
          errors: event.params.errors,
          update: expand(event.params.update),
        }));
      }
    });
  };

  cancel = () => this.onCancel();

  submit = () => this.onSubmit();

  run = (maybePromise, resolveHandler, rejectHandler) => {
    const self = this;
    const resolve = resolveHandler || noop;
    const reject = rejectHandler || defaultReject;
    if (maybePromise && maybePromise.then) {
      return maybePromise
        .then((...args) => resolve.call(self, ...args))
        .catch((...args) => reject.call(self, ...args));
    }
    return resolve.call(self, maybePromise);
  };

  clickListener = (event) => {
    if (Platform.OS === 'web') {
      if (!isField(event.target, this.fieldRegex)) {
        this.onMount(() => this.onFocus());
      }
    }
  };

  filterEmpty(values, path = '', type = 'object') {
    const self = this;
    const { required } = self.state;
    const filteredValues = type === 'object' ? {} : [];
    const add = type === 'object' ? addToObject(filteredValues) : addToArray(filteredValues);
    each(values, (v, k) => {
      let empty = false;
      const name = path ? `${path}.${k}` : k;
      let value = v;
      if (isArray(v)) {
        value = self.filterEmpty(v, name, 'array');
        empty = value.length === 0;
      } else if (isPlainObject(v)) {
        value = self.filterEmpty(v, name, 'object');
        empty = Object.keys(value).length === 0;
      } else {
        empty = value === '' || value === undefined || value === null;
      }
      if (required[toPath(name, '[]')] || !empty) {
        add(value, k);
      }
    });
    return filteredValues;
  }

  render() {
    const {
      event,
      schema,
      uiSchema,
      meta,
      values,
      errors,
      focus,
      update,
      required,
      clearCache,
    } = this.state;
    const {
      theme,
      children,
      cancelButton,
      CancelButton,
      submitButton,
      SubmitButton,
      buttonPosition,
    } = this.props;

    if (clearCache || update === 'all') {
      const nextState = {};
      if (clearCache) {
        nextState.clearCache = false;
      }
      if (update === 'all') {
        nextState.update = {};
      }
      setTimeout(() => this.onMount(() => this.setState(nextState)));
    }
    const { ObjectField } = fields;
    return (
      <React.Fragment>
        <Row className={`Form ${this.id}`} style={styles.form}>
          <ObjectField
            name=""
            theme={theme}
            id={this.id}
            event={event}
            schema={schema}
            uiSchema={uiSchema}
            meta={meta}
            value={values}
            values={values}
            errors={errors}
            focus={focus}
            update={update}
            required={required}
            fields={fields}
            widgets={this.widgets}
            onFocus={this.onFocus}
            onChange={this.onChange}
            onSubmit={this.onSubmit}
            clearCache={clearCache}
          />
        </Row>
        {children || (submitButton === false && cancelButton === false) ? children : (
          <Row className="Form__buttonContainer" style={getButtonPosition(buttonPosition)}>
            {cancelButton ? (
              <CancelButton
                onPress={this.onCancel}
                text={isString(cancelButton) ? cancelButton : 'Cancel'}
              />
            ) : null}
            {submitButton ? (
              <SubmitButton
                onPress={this.onSubmit}
                text={isString(submitButton) ? submitButton : 'Submit'}
              />
            ) : null}
          </Row>
        )}
      </React.Fragment>
    );
  }
}

export default withTheme('JsonSchemaForm')(Form);
