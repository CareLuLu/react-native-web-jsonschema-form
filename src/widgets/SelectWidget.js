import React from 'react';
import PropTypes from 'prop-types';
import { isArray, isNaN, without } from 'lodash';
import Select from 'react-native-web-ui-components/Select';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import { useOnChange, useOnFocus } from '../utils';

const parser = ({ schema }) => (value) => {
  let parsedValue = value;
  if (schema.type === 'number' || schema.type === 'integer') {
    parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      parsedValue = null;
    }
  } else if (schema.type === 'boolean') {
    parsedValue = value === 'true';
  }
  return parsedValue;
};

const SelectWidget = (props) => {
  const {
    schema,
    uiSchema,
    hasError,
    name,
    focus,
    value,
    readonly,
    disabled,
    placeholder,
    auto,
    style,
  } = props;

  const onFocus = useOnFocus(props);
  const onChange = useOnChange({ ...props, parser });

  let values = uiSchema['ui:enum'] || schema.enum || [];
  if (isArray(uiSchema['ui:enumExcludes'])) {
    values = without(values, uiSchema['ui:enumExcludes']);
  }
  const labels = uiSchema['ui:enumNames'] || schema.enumNames || values;
  const autoFocus = focus === name || (focus === null && uiSchema['ui:autofocus']);
  return (
    <Select
      disabled={disabled}
      readonly={readonly}
      hasError={hasError}
      auto={auto}
      name={name}
      value={`${value}`}
      values={values.map(v => `${v}`)}
      labels={labels}
      autoFocus={autoFocus}
      onFocus={onFocus}
      onChange={onChange}
      placeholder={placeholder}
      containerStyle={style}
    />
  );
};

SelectWidget.propTypes = {
  schema: PropTypes.shape().isRequired,
  uiSchema: PropTypes.shape().isRequired,
  hasError: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  focus: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  placeholder: PropTypes.string,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  auto: PropTypes.bool,
  style: StylePropType,
};

SelectWidget.defaultProps = {
  focus: null,
  value: '',
  placeholder: '',
  readonly: false,
  disabled: false,
  auto: false,
  style: null,
};

export default SelectWidget;
