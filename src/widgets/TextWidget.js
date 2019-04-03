import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform } from 'react-native';
import { noop } from 'lodash';
import { withHandlers } from 'recompact';
import { TextInput, StylePropType } from 'react-native-web-ui-components';

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

const maskOptions = {
  undefined: /^$/,
  a: /^[A-Za-zÀ-ÖØ-öø-ÿ]$/,
  9: /^[0-9]$/,
  '*': /^.$/,
};

const formatMask = (text, mask) => {
  let result = '';
  let cursorText = 0;
  let cursorMask = 0;
  for (; cursorText < text.length; cursorText += 1) {
    let charText = text[cursorText];
    let charMask;
    let extras = '';
    do {
      charMask = mask[cursorMask];
      cursorMask += 1;
      if (!(charMask in maskOptions)) {
        extras += charMask;
        if (charMask === charText) {
          cursorText += 1;
          charText = text[cursorText] || '';
          result += extras;
          extras = '';
        }
      }
    } while (!(charMask in maskOptions));
    if (maskOptions[charMask].test(charText)) {
      result += extras + charText;
    }
  }
  return result;
};

const TextWidget = withHandlers({
  onWrappedFocus: ({ onFocus }) => () => onFocus(),
  onWrappedChange: ({ mask, onChange }) => (text) => {
    if (!mask) {
      return onChange(text);
    }
    if (typeof mask === 'function') {
      return onChange(mask(text));
    }
    return onChange(formatMask(text, mask));
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
  onWrappedChange,
  onWrappedFocus,
  ...props
}) => {
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

TextWidget.propTypes = {
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
};

TextWidget.defaultProps = {
  style: styles.empty,
  mask: null,
  onFocus: noop,
  onChange: noop,
  onSubmit: noop,
  focus: null,
  value: '',
  placeholder: '',
  readonly: false,
  disabled: false,
  secureTextEntry: false,
  keyboardType: 'default',
  multiline: false,
  numberOfLines: 1,
  auto: false,
};

export default TextWidget;
