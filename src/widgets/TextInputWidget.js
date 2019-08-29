import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform } from 'react-native';
import { noop, isString, isFunction } from 'lodash';
import TextInput from 'react-native-web-ui-components/TextInput';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import {
  isEmpty,
  formatMask,
  useOnFocus,
} from '../utils';

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

const parser = ({ mask, textParser }) => (text) => {
  if (!mask) {
    return textParser(text);
  }
  if (isFunction(mask)) {
    return textParser(mask(text, 'out'));
  }
  return textParser(formatMask(text, mask));
};

const getTextValue = ({ mask, value }) => {
  let textValue = '';
  if (value !== null && value !== undefined) {
    if (isString(mask)) {
      textValue = formatMask(`${value}`, mask);
    } else if (isFunction(mask)) {
      textValue = mask(`${value}`, 'in');
    } else {
      textValue = value;
    }
  }
  return textValue;
};

const useTextInputHandlers = (props) => {
  const {
    onChange,
    value,
    name,
    mask,
    focus,
    uiSchema,
    onSubmit,
    multiline,
    textParser,
    onChangeText,
  } = props;

  const textValue = getTextValue(props);
  if (value !== null && value !== undefined && mask) {
    const maskedValue = textParser(textValue);
    if (value !== maskedValue) {
      setTimeout(() => onChange(maskedValue, name, {
        silent: true,
      }));
    }
  }

  const [text, setText] = useState(textValue);

  const onChangeTextHandler = (nextText) => {
    const nextValue = parser(props)(nextText);
    const nextTextValue = getTextValue({ ...props, value: nextValue });
    if (onChangeText) {
      onChangeText(nextTextValue);
    }
    setText(nextTextValue);
  };

  const onFocus = useOnFocus(props);

  const onBlur = () => {
    const nextValue = parser(props)(text);
    if (nextValue !== value) {
      onChange(nextValue, name, {
        silent: true,
      });
    }
  };

  const onSubmitEditing = () => {
    const nextValue = parser(props)(text);
    if (nextValue !== value) {
      onChange(nextValue, name);
    }
    onSubmit();
  };

  const selection = useRef();
  if (!selection.current) {
    selection.current = {
      start: text.length,
      end: text.length,
    };
  }

  const params = {
    onBlur,
    onFocus,
    onChangeText: onChangeTextHandler,
    onSubmitEditing: multiline ? noop : onSubmitEditing,
    autoFocus: focus === name || (focus === null && uiSchema['ui:autofocus']),
    value: isEmpty(text) ? (uiSchema['ui:emptyValue'] || '') : text,
  };

  if (!mask && Platform.OS === 'web') {
    params.selection = selection.current;
    params.onSelectionChange = (event) => {
      selection.current = {
        start: event.nativeEvent.selection.start,
        end: event.nativeEvent.selection.end,
      };
    };
  }

  return params;
};

const TextInputWidget = (props) => {
  const params = useTextInputHandlers(props);

  const {
    name,
    auto,
    style,
    multiline,
    hasError,
    disabled,
    readonly,
    placeholder,
    keyboardType,
    numberOfLines,
    secureTextEntry,
    Input,
    inputProps,
  } = props;

  const currentStyle = [
    styles.defaults,
    auto ? styles.auto : styles.fullWidth,
    style,
  ];

  return (
    <Input
      {...params}
      key={name}
      hasError={hasError}
      disabled={disabled}
      readonly={readonly}
      autoCapitalize="none"
      className="TextInput__widget"
      style={currentStyle}
      multiline={multiline}
      numberOfLines={numberOfLines}
      keyboardType={Platform.OS !== 'web' ? keyboardType : undefined}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      {...inputProps}
    />
  );
};

TextInputWidget.propTypes = {
  name: PropTypes.string.isRequired,
  uiSchema: PropTypes.shape().isRequired,
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
  onChangeText: PropTypes.func,
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
  onChangeText: null,
};

export default TextInputWidget;
