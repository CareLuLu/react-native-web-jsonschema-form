import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform } from 'react-native';
import { noop, isString, isFunction } from 'lodash';
import TextInput from 'react-native-web-ui-components/TextInput';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import { isEmpty, formatMask } from '../utils';

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

class TextInputWidget extends React.Component {
  static propTypes = {
    update: PropTypes.oneOfType([PropTypes.shape(), PropTypes.string]).isRequired,
    renderId: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    uiSchema: PropTypes.shape().isRequired,
    hasError: PropTypes.bool.isRequired,
    style: StylePropType,
    mask: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    onBlur: PropTypes.func,
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

  static defaultProps = {
    style: styles.empty,
    mask: null,
    onBlur: noop,
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

  static getDerivedStateFromProps(nextProps, prevState) {
    const state = {};

    const { update, value, renderId } = nextProps;
    const { valueProp, renderIdProp } = prevState;

    if (value !== valueProp) {
      state.valueProp = value;
    }
    if (renderId !== renderIdProp) {
      state.renderIdProp = renderId;
    }
    if (update === 'all' && value !== valueProp && renderId !== renderIdProp) {
      state.text = getTextValue(nextProps);
    }
    if (!Object.keys(state).length) {
      return null;
    }
    return state;
  }

  constructor(props) {
    super(props);
    const { value, renderId, uiSchema } = props;

    const text = getTextValue(props);
    this.selection = {
      start: text.length,
      end: text.length,
    };

    this.state = {
      text,
      valueProp: value,
      renderIdProp: renderId,
      autoFocus: !!uiSchema['ui:autofocus'],
    };
  }

  parse = (text) => {
    const { mask, textParser } = this.props;
    if (!mask) {
      return textParser(text);
    }
    if (isFunction(mask)) {
      return textParser(mask(text, 'out'));
    }
    return textParser(formatMask(text, mask));
  };

  setText = text => this.setState({ text });

  onRef = (input) => {
    this.input = input;
  };

  onKeyPress = (event) => {
    const { key } = event.nativeEvent;
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      this.scrolled = true;
    }
  };

  onChangeText = (nextText) => {
    const { onChangeText } = this.props;
    const nextValue = this.parse(nextText);
    const nextTextValue = getTextValue({ ...this.props, value: nextValue });
    if (onChangeText) {
      onChangeText(nextTextValue);
    }
    this.setText(nextTextValue);
  };

  onContentSizeChange = () => {
    this.scrolled = true;
  };

  onBlur = (...args) => {
    const {
      name,
      value,
      onBlur,
      onChange,
      changeOnblur,
      multiline,
    } = this.props;

    if (this.scrolled && Platform.OS === 'web' && this.input && multiline) {
      this.input.focus();
    } else {
      this.setState({ autoFocus: false });
      const { text } = this.state;
      const nextValue = this.parse(text);
      if (onBlur) {
        onBlur(...args);
      }
      if (changeOnblur && nextValue !== value) {
        onChange(nextValue, name);
      }
    }
  };

  onFocus = (...args) => {
    this.scrolled = false;
    this.setState({ autoFocus: true });
    const { onFocus } = this.props;
    if (onFocus) {
      onFocus(...args);
    }
  };

  onSubmitEditing = () => {
    const { text } = this.state;
    const {
      name,
      value,
      onChange,
      onSubmit,
      changeOnblur,
    } = this.props;
    const nextValue = this.parse(text);
    if (changeOnBlur && nextValue !== value) {
      onChange(nextValue, name);
    }
    onSubmit();
  };

  onSelectionChange = (event) => {
    this.selection = {
      start: event.nativeEvent.selection.start,
      end: event.nativeEvent.selection.end,
    };
  };

  render() {
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
      register,
      uiSchema,
      mask,
    } = this.props;

    const { text, autoFocus } = this.state;

    register(this.setText);

    const currentStyle = [
      styles.defaults,
      auto ? styles.auto : styles.fullWidth,
      style,
    ];

    const selectionProps = {};
    if (!mask && Platform.OS === 'web') {
      selectionProps.selection = this.selection;
      selectionProps.onSelectionChange = this.onSelectionChange;
    }

    return (
      <Input
        key={name}
        hasError={hasError}
        disabled={disabled}
        readonly={readonly}
        autoFocus={autoFocus}
        autoCapitalize="none"
        className="TextInput__widget"
        style={currentStyle}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={Platform.OS !== 'web' ? keyboardType : undefined}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        onRef={this.onRef}
        onBlur={this.onBlur}
        onFocus={this.onFocus}
        onKeyPress={this.onKeyPress}
        onChangeText={this.onChangeText}
        onSubmitEditing={multiline ? noop : this.onSubmitEditing}
        onContentSizeChange={this.onContentSizeChange}
        value={isEmpty(text) ? (uiSchema['ui:emptyValue'] || '') : text}
        {...selectionProps}
        {...inputProps}
      />
    );
  }
}

export default TextInputWidget;
