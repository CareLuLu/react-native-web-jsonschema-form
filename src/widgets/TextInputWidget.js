import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform } from 'react-native';
import { noop, isString } from 'lodash';
import { withHandlers } from 'recompact';
import TextInput from 'react-native-web-ui-components/TextInput';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import { formatMask } from '../utils';

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
    if (typeof mask === 'function') {
      return onChange(textParser(mask(text)), name);
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
  ...props
}) => {
  if (mask && isString(mask) && value !== null && value !== undefined) {
    const maskedValue = textParser(formatMask(value, mask));
    if (value !== maskedValue) {
      setTimeout(() => onChange(maskedValue, name, {
        silent: true,
      }));
    }
  }
  const currentStyle = [
    styles.defaults,
    auto ? styles.auto : styles.fullWidth,
    props.style, // eslint-disable-line
  ];
  const focused = focus === name || (focus === null && uiSchema['ui:autofocus']);
  return (
    <TextInput
      hasError={hasError}
      disabled={disabled}
      readonly={readonly}
      autoCapitalize="none"
      className="text-widget"
      style={currentStyle}
      onFocus={onWrappedFocus}
      onSubmitEditing={multiline ? noop : onSubmit}
      onChangeText={onWrappedChange}
      autoFocus={focused}
      multiline={multiline}
      numberOfLines={numberOfLines}
      keyboardType={Platform.OS !== 'web' ? keyboardType : undefined}
      value={(value !== undefined && value !== null ? `${value}` : '') || uiSchema['ui:emptyValue'] || ''}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
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
};

export default TextInputWidget;
