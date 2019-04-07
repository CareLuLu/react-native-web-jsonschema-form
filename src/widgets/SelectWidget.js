import React from 'react';
import PropTypes from 'prop-types';
import { withHandlers } from 'recompact';
import Select from 'react-native-web-ui-components/Select';
import StylePropType from 'react-native-web-ui-components/StylePropType';

const SelectWidget = withHandlers({
  onWrappedChange: ({ name, onChange }) => value => onChange(value, name),
  onWrappedFocus: ({ name, onFocus }) => () => onFocus(name),
})(({
  schema,
  uiSchema,
  hasError,
  onWrappedFocus,
  onWrappedChange,
  name,
  focus,
  value,
  readonly,
  disabled,
  placeholder,
  auto,
  style,
}) => {
  const values = schema.enum || uiSchema['ui:enum'] || [];
  const labels = schema.enumNames || uiSchema['ui:enumNames'] || values;
  const autoFocus = focus === name || (focus === null && uiSchema['ui:autofocus']);
  return (
    <Select
      disabled={disabled}
      readonly={readonly}
      hasError={hasError}
      auto={auto}
      name={name}
      value={value}
      values={values}
      labels={labels}
      autoFocus={autoFocus}
      onFocus={onWrappedFocus}
      onChange={onWrappedChange}
      placeholder={placeholder}
      containerStyle={style}
    />
  );
});

SelectWidget.propTypes = {
  schema: PropTypes.shape({}).isRequired,
  uiSchema: PropTypes.shape({}).isRequired,
  hasError: PropTypes.bool.isRequired,
  onFocus: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
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
