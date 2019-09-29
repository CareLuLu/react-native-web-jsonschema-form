import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform } from 'react-native';
import {
  set,
  get,
  each,
  noop,
  cloneDeep,
  isString,
  isArray,
  isError,
  isPlainObject,
} from 'lodash';
import Row from 'react-native-web-ui-components/Row';
import { withTheme } from 'react-native-web-ui-components/Theme';
import {
  toPath,
  expand,
  getMetas,
  getValues,
  getErrors,
  getRequired,
  getStructure,
  getExceptions,
  normalized,
} from './utils';
import fields from './fields';
import defaultWidgets from './widgets';
import FormEvent from './FormEvent';
import DefaultCancelButton from './CancelButton';
import DefaultSubmitButton from './SubmitButton';

export {
  FIELD_KEY,
  FIELD_NAME,
  FIELD_VALUE,
  FIELD_TITLE,
} from './utils';

const emptyObject = {};

const emptySchema = {
  type: 'object',
  properties: [],
};

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

class JsonSchemaForm extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    schema: PropTypes.shape(),
    uiSchema: PropTypes.shape(),
    metaSchema: PropTypes.shape(),
    errorSchema: PropTypes.shape(),
    formData: PropTypes.shape(),
    children: PropTypes.node,
    onRef: PropTypes.func,
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
    widgets: PropTypes.shape(),
    filterEmptyValues: PropTypes.bool,
    insideClickRegex: PropTypes.instanceOf(RegExp),
  };

  static defaultProps = {
    name: null,
    formData: emptyObject,
    schema: emptySchema,
    uiSchema: emptyObject,
    metaSchema: undefined,
    errorSchema: emptyObject,
    children: null,
    onRef: noop,
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
    widgets: emptyObject,
    filterEmptyValues: false,
    insideClickRegex: undefined,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const state = {
      clearCache: false,
    };
    let clear = false;
    let {
      metas,
      values,
      errors,
      schema,
      uiSchema,
    } = prevState;

    // If the schema or uiSchema is different, we recalculate everything
    const { schemaProp, uiSchemaProp } = prevState;
    if (nextProps.schema !== schemaProp || nextProps.uiSchema !== uiSchemaProp) {
      clear = true;
      const structure = getStructure(nextProps.schema, nextProps.uiSchema);
      schema = structure.schema;
      uiSchema = structure.uiSchema;
      state.schema = schema;
      state.uiSchema = uiSchema;
      state.update = 'all';
      state.clearCache = true;
      state.schemaProp = nextProps.schema;
      state.uiSchemaProp = nextProps.uiSchema;
      state.required = getRequired(schema);
    }

    // Check for formData updates
    if (clear || nextProps.formData !== prevState.formDataProp) {
      values = getValues(cloneDeep(nextProps.formData), schema);
      state.values = values;
      state.update = 'all';
      state.formDataProp = nextProps.formData;
    }

    // Check for errorSchema updates
    if (clear || nextProps.errorSchema !== prevState.errorSchemaProp) {
      errors = getErrors(cloneDeep(nextProps.errorSchema), schema);
      state.errors = errors;
      state.update = 'all';
      state.errorSchemaProp = nextProps.errorSchema;
    }

    // Check for metaSchema updates
    if (clear || nextProps.metaSchema !== prevState.metaSchemaProp) {
      metas = getMetas(cloneDeep(nextProps.metaSchema || values), schema, uiSchema);
      state.metas = metas;
      state.update = 'all';
      state.metaSchemaProp = nextProps.metaSchema;
    }

    return state;
  }

  constructor(props) {
    super(props);

    const {
      name,
      onRef,
      widgets,
      formData,
      schema,
      uiSchema,
      metaSchema,
      errorSchema,
      insideClickRegex,
    } = props;

    this.id = `Form__${name || Math.random().toString(36).substr(2, 9)}`;
    this.fieldRegex = insideClickRegex || new RegExp(`(${this.id}-field|react-datepicker)`);
    this.mountSteps = [];
    this.widgets = Object.assign({}, defaultWidgets, widgets);

    const structure = getStructure(schema, uiSchema);
    const values = getValues(cloneDeep(formData), structure.schema);
    const errors = getErrors(cloneDeep(errorSchema), structure.schema);
    const metas = getMetas(cloneDeep(metaSchema || values), structure.schema, structure.uiSchema);
    const required = getRequired(structure.schema);

    this.state = {
      values,
      errors,
      metas,
      required,
      schema: structure.schema,
      uiSchema: structure.uiSchema,
      formDataProp: formData,
      schemaProp: schema,
      uiSchemaProp: uiSchema,
      errorSchemaProp: errorSchema,
      metaSchemaProp: metaSchema,
      update: {},
      clearCache: false,
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

  onMount(handler) {
    if (handler) {
      this.mountSteps.push(handler);
    }
    if (this.mounted) {
      const fn = this.mountSteps.shift();
      if (fn) {
        fn.call(this);
      }
    }
  }

  onChange = (value, name, params = {}) => {
    const {
      update = [],
      nextErrors = false,
      nextMeta = false,
      silent = false,
    } = params;

    const { metas, values, errors } = this.state;
    const { onChange } = this.props;

    const event = new FormEvent('change', {
      name,
      value,
      values,
      metas,
      nextMeta,
      nextErrors,
      silent,
      path: toPath(name),
      update: [name].concat(update),
    });

    this.run(onChange(event), () => {
      if (!event.isDefaultPrevented()) {
        const { path } = event.params;
        set(event.params.values, path, event.params.value);
        if (event.params.nextMeta !== false) {
          set(metas, path, event.params.nextMeta);
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
          metas: { ...metas },
          errors: { ...errors },
          values: { ...event.params.values },
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
    const { metas, values } = this.state;
    const { onSubmit, filterEmptyValues } = this.props;
    let nextValues = this.filterDisabled(values, metas);
    if (filterEmptyValues) {
      nextValues = this.filterEmpty(nextValues);
    }
    const event = new FormEvent('submit', { values: nextValues });
    this.run(onSubmit(event), (response) => {
      if (!event.isDefaultPrevented()) {
        this.onSuccess(response);
      }
    }, (errorSchema) => {
      if (!event.isDefaultPrevented()) {
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
      if (!event.isDefaultPrevented()) {
        this.onMount(() => this.setState({
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
      errorSchema = { Error: [err.message] };
    }
    const errors = getErrors(errorSchema || {}, schema);
    const exceptions = getExceptions(errorSchema, errors);
    const event = new FormEvent('error', {
      errors,
      exceptions,
      update: 'all',
    });
    this.run(onError(event), () => {
      if (!event.isDefaultPrevented()) {
        this.onMount(() => this.setState({
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

  filterDisabled(values, metas, path = '', type = 'object') {
    const self = this;
    const filteredValues = type === 'object' ? {} : [];
    const add = type === 'object' ? addToObject(filteredValues) : addToArray(filteredValues);
    each(values, (v, k) => {
      const disabled = !!(metas && metas[k] && metas[k]['ui:disabled']);
      if (!disabled) {
        const name = path ? `${path}.${k}` : k;
        let value = v;
        if (isArray(v)) {
          value = self.filterDisabled(v, (metas && metas[k]) || [], name, 'array');
        } else if (isPlainObject(v)) {
          value = self.filterDisabled(v, (metas && metas[k]) || {}, name, 'object');
        }
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
      metas,
      values,
      errors,
      update,
      required,
      clearCache,
    } = this.state;

    const {
      children,
      cancelButton,
      CancelButton,
      submitButton,
      SubmitButton,
      buttonPosition,
    } = this.props;

    const { ObjectField } = fields;

    return (
      <React.Fragment>
        <Row className={`Form ${this.id}`} style={styles.form}>
          <ObjectField
            {...this.props}
            name=""
            id={this.id}
            event={event}
            schema={schema}
            uiSchema={uiSchema}
            meta={metas}
            metas={metas}
            value={values}
            values={values}
            errors={errors}
            update={update}
            required={required}
            fields={fields}
            widgets={this.widgets}
            onChange={this.onChange}
            onSubmit={this.onSubmit}
            renderId={Math.random()}
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

export default withTheme('JsonSchemaForm')(JsonSchemaForm);
