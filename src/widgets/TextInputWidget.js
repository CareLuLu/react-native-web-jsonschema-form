import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform } from 'react-native';
import { noop, isString, isFunction } from 'lodash';
import { withHandlers } from 'recompact';
import TextInput from 'react-native-web-ui-components/TextInput';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import { formatMask, isEmpty } from '../utils';

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

const TextInputWidget = withHandlers({
  onWrappedFocus: ({ name, onFocus }) => () => onFocus(name),
  onWrappedChange: ({
    name,
    mask,
    onChange,
    textParser,
  }) => (text) => {
    if (!mask) {
      return onChange(textParser(text), name);
    }
    if (isFunction(mask)) {
      return onChange(textParser(mask(text, 'out')), name);
    }
    return onChange(textParser(formatMask(text, mask)), name);
  },
})(({
  uiSchema,
  hasError,
  onSubmit,
  name,
  focus,
  value,
  readonly,
  disabled,
  secureTextEntry,
  placeholder,
  mask,
  keyboardType,
  multiline,
  numberOfLines,
  auto,
  onChange,
  onWrappedChange,
  onWrappedFocus,
  textParser,
  Input,
  inputProps,
  style,
}) => {
  let textValue = '';
  if (value !== null && value !== undefined) {
    if (isString(mask)) {
      textValue = formatMask(`${value}`, mask);
    } else if (isFunction(mask)) {
      textValue = mask(`${value}`, 'in');
    } else {
      textValue = value;
    }
    if (mask) {
      const maskedValue = textParser(textValue);
      if (value !== maskedValue) {
        setTimeout(() => onChange(maskedValue, name, {
          silent: true,
        }));
      }
    }
  }
  const currentStyle = [
    styles.defaults,
    auto ? styles.auto : styles.fullWidth,
    style,
  ];
  const focused = focus === name || (focus === null && uiSchema['ui:autofocus']);
  return (
    <Input
      hasError={hasError}
      disabled={disabled}
      readonly={readonly}
      autoCapitalize="none"
      className="TextInput__widget"
      style={currentStyle}
      onFocus={onWrappedFocus}
      onSubmitEditing={multiline ? noop : onSubmit}
      onChangeText={onWrappedChange}
      autoFocus={focused}
      multiline={multiline}
      numberOfLines={numberOfLines}
      keyboardType={Platform.OS !== 'web' ? keyboardType : undefined}
      value={isEmpty(textValue) ? (uiSchema['ui:emptyValue'] || '') : textValue}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      {...inputProps}
    />
  );
});

TextInputWidget.propTypes = {
  name: PropTypes.string.isRequired,
  uiSchema: PropTypes.shape({}).isRequired,
  hasError: PropTypes.bool.isRequired,
  style: StylePropType,
  mask: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onFocus: PropTypes.func,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  focus: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  placeholder: PropTypes.string,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  secureTextEntry: PropTypes.bool,
  keyboardType: PropTypes.string,
  multiline: PropTypes.bool,
  numberOfLines: PropTypes.number,
  auto: PropTypes.bool,
  textParser: PropTypes.func,
  Input: PropTypes.elementType,
  inputProps: PropTypes.shape(),
};

TextInputWidget.defaultProps = {
  style: styles.empty,
  mask: null,
  onFocus: noop,
  onChange: noop,
  onSubmit: noop,
  focus: null,
  value: null,
  placeholder: '',
  readonly: false,
  disabled: false,
  secureTextEntry: false,
  keyboardType: 'default',
  multiline: false,
  numberOfLines: 1,
  auto: false,
  textParser: value => value,
  Input: TextInput,
  inputProps: {},
};

export default TextInputWidget;
