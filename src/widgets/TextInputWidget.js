import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform } from 'react-native';
import { noop, isString, isFunction } from 'lodash';
import TextInput from 'react-native-web-ui-components/TextInput';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import {
  isEmpty,
  formatMask,
  useAutoFocus,
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
    uiSchema,
    onSubmit,
    multiline,
    textParser,
    onChangeText,
    update,
    renderId,
    register,
    changeOnblur,
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
  const [valueProp, setValueProp] = useState(value);
  const [renderIdProp, setRenderIdProp] = useState(update);

  register(setText);

  const adjustments = [];
  if (value !== valueProp) {
    adjustments.push(() => setValueProp(value));
  }
  if (renderId !== renderIdProp) {
    adjustments.push(() => setRenderIdProp(renderId));
  }

  let currentText = text;
  if (update === 'all' && adjustments.length === 2) {
    currentText = getTextValue(props);
    adjustments.push(() => setText(currentText));
  }

  if (adjustments.length) {
    setTimeout(() => adjustments.map(adjust => adjust()));
  }

  const onChangeTextHandler = (nextText) => {
    const nextValue = parser(props)(nextText);
    const nextTextValue = getTextValue({ ...props, value: nextValue });
    if (onChangeText) {
      onChangeText(nextTextValue);
    }
    setText(nextTextValue);
  };

  const onBlur = () => {
    const nextValue = parser(props)(currentText);
    if (changeOnblur && nextValue !== value) {
      onChange(nextValue, name, {
        silent: true,
      });
    }
  };

  const onSubmitEditing = () => {
    const nextValue = parser(props)(currentText);
    if (nextValue !== value) {
      onChange(nextValue, name);
    }
    onSubmit();
  };

  const selection = useRef();
  if (!selection.current || adjustments.length === 3) {
    selection.current = {
      start: currentText.length,
      end: currentText.length,
    };
  }

  const autoFocusParams = useAutoFocus({ ...props, onBlur });

  const params = {
    ...autoFocusParams,
    onChangeText: onChangeTextHandler,
    onSubmitEditing: multiline ? noop : onSubmitEditing,
    value: isEmpty(currentText) ? (uiSchema['ui:emptyValue'] || '') : currentText,
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
  register: PropTypes.func,
  changeOnblur: PropTypes.bool,
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
  register: noop,
  changeOnblur: true,
};

export default TextInputWidget;
