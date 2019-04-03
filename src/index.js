import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform } from 'react-native';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import {
  get,
  each,
  isDate,
  isString,
  isNumber,
  isBoolean,
  isEqual,
  isObject,
  isArray,
  uniq,
  flatten,
  indexOf,
  noop,
} from 'lodash';
import { compose } from 'recompact';
import { URL } from '../config';
import { USER_FORM, USER_CURRENT, USER_CURRENT_FIELDS } from '../graphql';
import { withAmp } from '../utils/amp';
import { withClient } from '../utils/apollo';
import { withPrefix, humanize } from '../utils/string';
import widgets from './widgets';
import fields from './fields';
import Text from './Text';
import Loading from './Loading';
import View from './View';
import LoadingBox from './LoadingBox';
import Alert from './Alert';
import Row from './Row';
import Button from './Button';
import Center from './Center';

/* eslint react/no-unused-prop-types: 0 */
/* eslint no-param-reassign: 0 */

const integerRegex = /^[0-9]+$/;

const styles = StyleSheet.create({
  loadingContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOuterContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainerCenter: {
    paddingTop: 5,
    justifyContent: 'center',
  },
  buttonContainerLeft: {
    paddingTop: 5,
    justifyContent: 'flex-start',
  },
  buttonContainerRight: {
    paddingTop: 5,
    justifyContent: 'flex-end',
  },
  submitButton: {
    marginRight: -5,
  },
  zIndex: {
    zIndex: 1,
  },
});

const FIELD_KEY_REGEX = /%key%/g;
const FIELD_NAME_REGEX = /%name%/g;
const FIELD_VALUE_REGEX = /%value%/g;
const FIELD_TITLE_REGEX = /%title%/g;

const emptyObject = {};

const isValid = (key, pick, omit, include) => (
  (include.length && include.indexOf(key) >= 0) || (
    (!pick.length || pick.indexOf(key) >= 0)
    && (!omit.length || omit.indexOf(key) < 0)
  )
);

const getRequired = (key, prefix, schema, required = {}) => {
  if (schema.type === 'object') {
    const objectPrefix = withPrefix(key, prefix);
    each(schema.required, (k) => {
      required[withPrefix(k, objectPrefix)] = 1;
    });
    each(schema.properties, (s, k) => getRequired(k, objectPrefix, s, required));
  }
  if (schema.type === 'array') {
    getRequired(`${key}[]`, prefix, schema.items, required);
  }
  return required;
};

const formatExpression = (expression, options) => {
  let formattedExpresion = expression || '';
  formattedExpresion = formattedExpresion.replace(FIELD_TITLE_REGEX, humanize(options.key || ''));
  formattedExpresion = formattedExpresion.replace(FIELD_KEY_REGEX, options.key);
  formattedExpresion = formattedExpresion.replace(FIELD_NAME_REGEX, options.name);
  formattedExpresion = formattedExpresion.replace(FIELD_VALUE_REGEX, options.value);
  return formattedExpresion;
};

const castValue = (value, schema) => {
  let castedValue;
  const type = schema.type || '';
  if (value === undefined || value === null) {
    switch (type) {
      case 'string': castedValue = schema.enum ? null : ''; break;
      case 'array': castedValue = []; break;
      case 'number':
      case 'float':
      case 'integer':
      case 'date':
      default: castedValue = null;
    }
  } else {
    switch (type) {
      case 'string': castedValue = `${value}`; break;
      case 'number':
      case 'float': castedValue = parseFloat(value); break;
      case 'integer':
      case 'date': castedValue = parseInt(value, 10); break;
      default: castedValue = value;
    }
  }
  return castedValue;
};

const formatValues = (key, prefix, values, schema, uiSchema, result = {}) => {
  if (schema.type === 'object') {
    const objectPrefix = withPrefix(key, prefix);
    if (key !== '') {
      result[key] = {};
    }
    let pick = uiSchema['ui:pick'] || [];
    if (pick === 'required') {
      pick = schema.required;
    } else if (pick) {
      const requiredIndex = indexOf(pick, '*required');
      if (requiredIndex >= 0) {
        pick = pick.concat([]);
        pick[requiredIndex] = schema.required;
        pick = uniq(flatten(pick));
      }
    }
    const omit = uiSchema['ui:omit'] || [];
    const include = uiSchema['ui:include'] || [];
    each(schema.properties, (s, k) => {
      if (isValid(k, pick, omit, include)) {
        formatValues(
          k,
          objectPrefix,
          values,
          s,
          uiSchema[k] || {},
          key !== '' ? result[key] : result,
        );
      }
    });
  } else if (schema.type === 'array') {
    result[key] = [];
    const keys = Object.keys(values).sort();
    const arrayPrefix = withPrefix(key, prefix);
    let lastKey;
    each(keys, (k) => {
      if (k.substring(0, key.length + 1) === `${key}.`) {
        lastKey = k;
      }
    });
    if (lastKey) {
      const max = parseInt(lastKey.replace(`${key}.`, '').split('.')[0], 10) + 1;
      for (let i = 0; i < max; i += 1) {
        formatValues(
          i,
          arrayPrefix,
          values,
          schema.items,
          uiSchema['ui:items'] || {},
          result[key],
        );
      }
    }
  } else if (key) {
    const value = castValue(values[withPrefix(key, prefix)], schema);
    if (value !== null && value !== undefined && value !== '') {
      result[key] = value;
    }
  }
  return result;
};

const flattenValues = (key, prefix, value, schema, result = {}) => {
  if (isObject(value) || isArray(value)) {
    each(value, (v, k) => flattenValues(
      k,
      withPrefix(key, prefix),
      v,
      schema.items || (schema.properties && schema.properties[k]) || {},
      result,
    ));
  } else {
    result[withPrefix(key, prefix)] = castValue(value, schema);
  }
  return result;
};

const getButtonPosition = (position) => {
  if (position === 'center') {
    return styles.buttonContainerCenter;
  }
  if (position === 'left') {
    return styles.buttonContainerLeft;
  }
  return styles.buttonContainerRight;
};

const getErrorExceptions = (errorSchema = {}, prefix = '', errors = []) => {
  if (
    isArray(errorSchema)
    && errorSchema.length
    && isString(errorSchema[0])
    && !errorSchema.tagged
  ) {
    if (prefix) {
      errors.push(`\n${prefix}:`);
    }
    Array.prototype.push.apply(errors, errorSchema);
    errorSchema.tagged = true;
  } else if (isObject(errorSchema) || isArray(errorSchema)) {
    each(errorSchema, (s, k) => getErrorExceptions(s, withPrefix(k, prefix), errors));
  }
  return errors;
};

const defaultParser = values => values;

const getStateFromProps = (props, state) => {
  const {
    user,
    instanceId,
    formData,
    uiSchema,
    errorSchema,
    controller,
    action,
    schema,
    onFocus,
    onChange,
    onSubmit,
    onCancel,
    onSuccess,
    onError,
    onWarningClose,
    submitHandler,
  } = props;
  const { formattedValues, skipReset } = state;
  let newFormattedValues = formattedValues;
  if (!isEqual(formData, state.formData)) {
    newFormattedValues = { ...user, ...formData };
  }

  const id = controller && action
    ? `form-${controller}.${action}` : `form-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    instanceId,
    user,
    formData,
    controller,
    action,
    schema,
    onFocus,
    onChange,
    onSubmit,
    onCancel,
    onSuccess,
    onError,
    onWarningClose,
    submitHandler,
    formattedValues: newFormattedValues,
    resetCache: !skipReset,
    update: 'all',
    uiSchema: uiSchema || {},
    errorSchema: errorSchema || {},
    values: flattenValues('', '', newFormattedValues, state.schema || schema || {}),
    errors: { ...errorSchema },
  };
};

class Form extends React.PureComponent {
  static propTypes = {
    amp: PropTypes.bool.isRequired,
    client: PropTypes.shape().isRequired,
    ampAltButton: PropTypes.string,
    instanceId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    formData: PropTypes.shape({}),
    uiSchema: PropTypes.shape({}),
    errorSchema: PropTypes.shape({}),
    children: PropTypes.node,
    controller: PropTypes.string,
    action: PropTypes.string,
    schema: PropTypes.shape({}),
    onRef: PropTypes.func,
    onFocus: PropTypes.func,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    onSuccess: PropTypes.func,
    onCacheUpdate: PropTypes.func,
    onError: PropTypes.func,
    onWarningClose: PropTypes.func,
    submitHandler: PropTypes.func,
    skipMessage: PropTypes.bool,
    skipErrorMessage: PropTypes.bool,
    loading: PropTypes.bool,
    cancelButton: PropTypes.bool,
    cancelButtonType: PropTypes.string,
    cancelButtonText: PropTypes.string,
    cancelButtonFlat: PropTypes.bool,
    submitButton: PropTypes.bool,
    submitButtonType: PropTypes.string,
    submitButtonText: PropTypes.string,
    submitButtonFlat: PropTypes.bool,
    buttonPosition: PropTypes.oneOf(['left', 'right', 'center']),
    user: PropTypes.shape({}),
    fragment: PropTypes.shape(),
    scroller: PropTypes.shape(),
    parser: PropTypes.func,
  };

  static defaultProps = {
    ampAltButton: '',
    instanceId: null,
    formData: emptyObject,
    uiSchema: emptyObject,
    errorSchema: emptyObject,
    children: null,
    controller: null,
    action: null,
    schema: null,
    onRef: noop,
    onFocus: noop,
    onChange: noop,
    onSubmit: noop,
    onCancel: noop,
    onSuccess: noop,
    onCacheUpdate: noop,
    onError: noop,
    onWarningClose: noop,
    submitHandler: noop,
    skipMessage: false,
    skipErrorMessage: false,
    loading: false,
    cancelButton: true,
    cancelButtonType: 'white',
    cancelButtonText: 'Cancel',
    cancelButtonFlat: false,
    submitButton: true,
    submitButtonType: 'pink',
    submitButtonText: 'Submit',
    submitButtonFlat: false,
    buttonPosition: 'right',
    user: emptyObject,
    fragment: null,
    scroller: null,
    parser: defaultParser,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEqual(nextProps.formData, prevState.formData)
      || !isEqual(nextProps.user, prevState.user)
      || nextProps.action !== prevState.action
      || nextProps.controller !== prevState.controller
      || !isEqual(nextProps.schema, prevState.schema)
      || nextProps.uiSchema !== prevState.uiSchema
      || nextProps.errorSchema !== prevState.errorSchema
      || nextProps.instanceId !== prevState.instanceId
    ) {
      return getStateFromProps(nextProps, prevState);
    }
    return null;
  }

  constructor(props) {
    super(props);
    const { onRef, client } = props;
    onRef(this);
    this.client = client;
    this.mounted = false;
    this.onMountHandlers = [];
    this.runSuccess = this.runSuccess.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeFormatted = this.onChangeFormatted.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onSuccess = this.onSuccess.bind(this);
    this.onError = this.onError.bind(this);
    this.onWarningClose = this.onWarningClose.bind(this);
    this.state = Object.assign({
      posting: false,
      warning: null,
      errors: {},
      success: null,
    }, getStateFromProps(props, {
      values: {},
      focus: null,
      skipReset: true,
    }));
    if (Platform.OS === 'web') {
      const self = this;
      const { id } = self.state;
      window.addEventListener('click', (e) => {
        const form = document.getElementsByClassName(id);
        if (!form.length || !form[0].contains(e.target)) {
          self.onMount(() => self.onFocus(''));
        }
      });
    }
  }

  componentDidMount() {
    this.mounted = true;
    this.onMount();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onMount(handler, timeout) {
    if (handler) {
      this.onMountHandlers.push(handler);
    }
    if (this.mounted) {
      const fn = this.onMountHandlers.shift();
      if (fn) {
        if (timeout) {
          setTimeout(fn, timeout);
        } else {
          fn();
        }
      }
    }
  }

  onClose() {
    if (this.onCloseHandler) {
      const { onCloseHandler } = this;
      this.onCloseHandler = null;
      this.onMount(onCloseHandler);
    }
  }

  onWarningClose() {
    const self = this;
    const { onWarningClose } = self.state;
    if (onWarningClose) {
      onWarningClose();
    }
    self.onMount(() => self.setState({
      warning: null,
    }));
  }

  onFocus(name, updates) {
    const { onFocus, focus } = this.state;
    const { scroller } = this.props;
    if (onFocus) {
      onFocus(name);
    }
    if (scroller) {
      scroller.setNativeProps({ scrollEnabled: true });
    }
    this.setState({
      focus: name,
      update: updates || [focus, name],
    });
  }

  onChange(value, name, silent = false) {
    const {
      values,
      errors,
      onChange,
      focus,
    } = this.state;
    const newValues = {
      ...values,
      [name]: value,
    };
    const formattedValues = this.getValues(newValues);
    if (!silent && onChange && onChange !== noop) {
      onChange(
        formattedValues,
        name,
        value,
      );
    }
    const path = name.split('.').map(v => (integerRegex.test(v) ? parseInt(v, 10) : v));
    const errorSchemaRoot = path.splice(0, path.length - 1);
    const errorSchema = errorSchemaRoot.length ? get(errors, errorSchemaRoot) : errors;
    const [key] = path;
    if (errorSchema && errorSchema[key]) {
      if (value !== errorSchema[key].lastValue) {
        errorSchema[key].hidden = true;
      } else {
        errorSchema[key].hidden = false;
      }
    }
    this.setState({
      errors,
      formattedValues,
      focus: silent ? focus : name,
      values: newValues,
      update: [name, focus],
    });
  }

  onChangeFormatted(newValues, name) {
    const { schema, onChange } = this.state;
    if (onChange && onChange !== noop) {
      onChange(newValues, name, null);
    }
    this.cache = null;
    this.setState({
      formattedValues: { ...newValues },
      focus: name,
      values: flattenValues('', '', newValues, schema || {}),
      update: 'all',
    });
  }

  onCancel() {
    const { onCancel } = this.state;
    if (onCancel) {
      onCancel();
    }
  }

  onSubmit() {
    const { onSubmit, values } = this.state;
    if (!onSubmit || onSubmit(values) !== false) {
      this.submit();
    }
  }

  onError(error) {
    const self = this;
    const { skipErrorMessage } = self.props;
    const { onError } = self.state;
    if (onError) {
      onError(error);
    }
    let warning;
    let errors;
    if (!error.graphQLErrors || !error.graphQLErrors.length) {
      errors = {};
      warning = error.message;
    } else if (error.graphQLErrors[0].code !== 'ERROR_INVALID_INPUT') {
      errors = {};
      warning = error.graphQLErrors[0].message;
    } else {
      errors = error.graphQLErrors[0].state;
      warning = null;
    }
    if (skipErrorMessage) {
      warning = null;
    }
    self.setState({
      errors,
      warning,
      success: false,
      posting: false,
      update: 'all',
    });
  }

  onSuccess(response) {
    const { skipMessage } = this.props;
    const { controller, action } = this.state;
    const message = controller && action
      ? response.data[controller][action].message : response.message;
    this.setState({
      warning: skipMessage || !message ? null : message,
      success: response,
      posting: false,
      update: 'all',
    });
  }

  getValues(newValues) {
    let { values } = this.state;
    const { uiSchema } = this.state;
    if (newValues !== undefined) {
      values = newValues;
    }
    return formatValues('', '', values, this.schema, uiSchema);
  }

  runSuccess() {
    const self = this;
    this.onMount(() => {
      const { success } = self.state;
      self.setState({
        warning: null,
        success: null,
      });
      self.props.onSuccess(success);
    });
  }

  submit() {
    const self = this;
    const { parser } = self.props;
    self.setState({
      errors: {},
      update: 'all',
      warning: null,
      posting: true,
    });
    const {
      controller,
      action,
      instanceId,
      submitHandler,
      formattedValues,
    } = self.state;
    const values = parser(formattedValues);
    const { fragment, onCacheUpdate } = self.props;
    if (controller && action) {
      let payload = '';
      each(values, (v, k) => {
        payload += `${k}: `;
        if (isNumber(v) || isBoolean(v)) {
          payload += v;
        } else if (isString(v)) {
          payload += `"${v.replace(/\n+/g, '\\n')}"`;
        } else if (isDate(v)) {
          payload += `"${v}"`;
        } else {
          payload += JSON.stringify(v).replace(/"([^"]+)":/g, '$1:');
        }
        payload += '\n';
      });
      const mutation = gql`
        mutation {
          ${controller}${instanceId ? `(id: ${instanceId})` : ''} {
            ${action}(with: {
              ${payload}
            }) {
              code,
              message,
              ${fragment ? `
                ${fragment.definitions[0].typeCondition.name.value} {
                  ...${fragment.definitions[0].name.value}
                }
              ` : ''}
            }
          }
          me(with: {}) {
            ...userCurrentFields
          }
          profile(with: {})
        }
        ${USER_CURRENT_FIELDS}
        ${fragment || ''}
      `;
      self.client.mutate({
        mutation,
        update: (cache, params) => {
          const { data } = params;
          const result = data && data[controller] && data[controller][action];
          if (result && result.me) {
            const { me, profile } = result;
            cache.writeQuery({
              query: USER_CURRENT,
              data: { me, profile },
            });
          }
          if (onCacheUpdate) {
            onCacheUpdate(cache, params);
          }
        },
      })
        .then(response => self.onSuccess(response))
        .catch(err => self.onError(err));
    } else {
      submitHandler(values)
        .then(response => self.onSuccess(response))
        .catch(err => self.onError(err));
    }
  }

  renderForm() {
    const {
      id,
      resetCache,
      values,
      errors,
      focus,
      update,
      uiSchema,
      posting,
      warning,
      success,
      formattedValues,
    } = this.state;
    const {
      children,
      loading,
      cancelButton,
      cancelButtonText,
      cancelButtonType,
      cancelButtonFlat,
      submitButton,
      submitButtonText,
      submitButtonType,
      submitButtonFlat,
      buttonPosition,
      scroller,
    } = this.props;

    if (resetCache) {
      const self = this;
      setTimeout(() => {
        self.cache = null;
        self.setState({ resetCache: false });
      });
    }

    let cached = true;
    if (!this.cache) {
      cached = false;
      const { schema } = this;
      const options = {
        getValues: this.getValues,
        onFocus: this.onFocus,
        onChange: this.onChange,
        onChangeFormatted: this.onChangeFormatted,
        onSubmit: this.onSubmit,
        onCancel: this.onCancel,
        required: getRequired('', '', schema),
      };
      const { ObjectField } = fields;
      let content = children;
      if (content === '%empty%') {
        content = null;
      }
      this.cache = props => (
        <React.Fragment>
          <Row className={`form ${id}`} style={styles.zIndex}>
            <ObjectField
              {...props}
              name=""
              schema={schema}
              uiSchema={uiSchema}
              fields={fields}
              widgets={widgets}
              options={options}
              castValue={castValue}
              flattenValues={flattenValues}
              formatExpression={formatExpression}
            />
          </Row>
          {(content !== undefined && content !== null) || children === '%empty%' ? content : (
            <Row className="form-button-container" style={getButtonPosition(buttonPosition)}>
              {cancelButton ? (
                <Button
                  auto
                  className="form-button-cancel"
                  flat={cancelButtonFlat}
                  type={cancelButtonType}
                  onPress={options.onCancel}
                >
                  {cancelButtonText}
                </Button>
              ) : null}
              {submitButton ? (
                <Button
                  auto
                  className="form-button-submit"
                  flat={submitButtonFlat}
                  type={submitButtonType}
                  style={styles.submitButton}
                  onPress={options.onSubmit}
                >
                  {submitButtonText}
                </Button>
              ) : null}
            </Row>
          )}
        </React.Fragment>
      );
    }
    const FormSchema = this.cache;
    if (success && !warning) {
      setTimeout(this.runSuccess);
    }
    const exceptions = getErrorExceptions(errors || {});
    if (exceptions.length) {
      const self = this;
      if (warning) {
        exceptions.unshift(warning);
      }
      setTimeout(() => self.setState({
        warning: exceptions.join('\n'),
      }));
    }
    return (
      <React.Fragment>
        {posting || loading ? <LoadingBox visible fixed={false} /> : null}
        {warning ? (
          <Alert visible fixed={false} onOk={this.onWarningClose}>
            {warning}
          </Alert>
        ) : null}
        {}
        <FormSchema
          form={this}
          scroller={scroller}
          update={update}
          cached={cached}
          formData={values}
          formattedValues={formattedValues}
          focus={focus}
          errorSchema={errors}
        >
          {children}
        </FormSchema>
      </React.Fragment>
    );
  }

  render() {
    const {
      controller,
      action,
      schema,
    } = this.state;
    const {
      ampAltButton,
      amp,
    } = this.props;
    if (amp) {
      const { router } = this.context;
      const { location } = router.history;
      return (
        <Center>
          <Button
            className="form-amp-button"
            flat={false}
            type="pink"
            to={`${URL}${location.pathname.replace('/amp', '')}${location.search}${location.hash}`}
          >
            {ampAltButton || humanize(action)}
          </Button>
        </Center>
      );
    }
    if (!schema && controller && action) {
      return (
        <Query query={USER_FORM} variables={{ controller, action }}>
          {({
            loading,
            error,
            data,
          }) => {
            if (loading) {
              return (
                <View style={styles.loadingOuterContainer}>
                  <View style={styles.loadingContainer}>
                    <Loading />
                  </View>
                </View>
              );
            }
            if (error) {
              return (
                <Text>
                  Error!
                  {error.message}
                </Text>
              );
            }
            this.schema = data.form;
            return this.renderForm();
          }}
        </Query>
      );
    }
    this.schema = schema;
    return this.renderForm();
  }
}

Form.contextTypes = {
  router: PropTypes.shape({
    history: PropTypes.shape({
      location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
        search: PropTypes.string.isRequired,
        hash: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

const WrappedForm = compose(
  withAmp(),
  withClient(),
)(Form);
WrappedForm.FIELD_KEY = '%key%';
WrappedForm.FIELD_NAME = '%name%';
WrappedForm.FIELD_VALUE = '%value%';
WrappedForm.FIELD_TITLE = '%title%';
WrappedForm.EMPTY = '%empty%';

export default WrappedForm;
