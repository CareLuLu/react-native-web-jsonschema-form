import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { isArray, isNaN, without } from 'lodash';
import Select from 'react-native-web-ui-components/Select';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import { useOnChange, useAutoFocus } from '../utils';

const styles = StyleSheet.create({
  defaults: {
    marginBottom: 10,
  },
  fullWidth: {
    width: '100%',
  },
  auto: {
    marginBottom: 0,
  },
});

const parser = ({ schema }) => (value) => {
  let parsedValue = value;
  if (schema.type === 'number' || schema.type === 'integer') {
    parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      parsedValue = null;
    }
  } else if (schema.type === 'boolean') {
    parsedValue = value;
  }
  return parsedValue;
};

const SelectWidget = (props) => {
  const {
    schema,
    uiSchema,
    hasError,
    name,
    value,
    readonly,
    disabled,
    placeholder,
    auto,
    style,
  } = props;

  const autoFocusParams = useAutoFocus(props);
  const onChange = useOnChange({ ...props, parser });

  let values = uiSchema['ui:enum'] || schema.enum || [];
  if (isArray(uiSchema['ui:enumExcludes'])) {
    values = without(values, uiSchema['ui:enumExcludes']);
  }
  const labels = uiSchema['ui:enumNames'] || schema.enumNames || values;

  const currentStyle = [
    styles.defaults,
    auto ? styles.auto : styles.fullWidth,
    style,
  ];

  return (
    <Select
      {...autoFocusParams}
      disabled={disabled}
      readonly={readonly}
      hasError={hasError}
      auto={auto}
      name={name}
      value={value}
      values={values}
      labels={labels}
      onChange={onChange}
      placeholder={placeholder}
      style={currentStyle}
    />
  );
};

SelectWidget.propTypes = {
  schema: PropTypes.shape().isRequired,
  uiSchema: PropTypes.shape().isRequired,
  hasError: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  auto: PropTypes.bool,
  style: StylePropType,
  value: PropTypes.any, // eslint-disable-line
};

SelectWidget.defaultProps = {
  value: '',
  placeholder: '',
  readonly: false,
  disabled: false,
  auto: false,
  style: null,
};

export default SelectWidget;
