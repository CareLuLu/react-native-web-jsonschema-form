import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { noop, pick, isFunction } from 'lodash';
import { withHandlers } from 'recompact';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import RNTagInput from 'react-native-web-ui-components/TagInput';

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

const allowedAttributes = [
  'hasError',
  'value',
  'readonly',
  'disabled',
  'secureTextEntry',
  'placeholder',
  'keyboardType',
  'multiline',
  'numberOfLines',
  'onChange',
  'onFocus',
  'items',
  'getItemValue',
  'isMatch',
  'text',
  'tagStyle',
  'inputStyle',
  'allowNew',
  'buildNew',
  'Item',
  'Menu',
  'Tag',
  'Input',
];

const parseValue = (type, text) => {
  if (type === 'number' || type === 'integer') {
    return parseFloat(text);
  }
  return text;
};

const TagInputWidget = withHandlers({
  onFocus: ({ name, onFocus }) => () => onFocus(name),
  onChange: ({ name, onChange }) => tags => onChange(tags, name),
  buildNew: ({ schema, buildNew }) => (text) => {
    if (isFunction(buildNew)) {
      return buildNew(text);
    }
    if (schema.items.type === 'object') {
      const [attribute] = Object.keys(schema.items.properties);
      const { type } = schema.items.properties[attribute];
      return { [attribute]: parseValue(type, text) };
    }
    return parseValue(schema.items.type, text);
  },
  getItemValue: ({ schema, getItemValue }) => (item) => {
    if (isFunction(getItemValue)) {
      return getItemValue(item);
    }
    if (schema.items.type === 'object') {
      const [attribute] = Object.keys(schema.items.properties);
      return item[attribute];
    }
    return item;
  },
})(({
  auto,
  name,
  focus,
  style,
  schema,
  uiSchema,
  ...props
}) => {
  if (schema.type !== 'array') {
    throw new Error('TagInputWidget can only be used with arrays.');
  }
  const currentStyle = [
    styles.defaults,
    auto ? styles.auto : styles.fullWidth,
    style,
  ];
  const focused = focus === name || (focus === null && uiSchema['ui:autofocus']);
  return (
    <RNTagInput
      {...pick(props, allowedAttributes)}
      autoCapitalize="none"
      className="TagInput__widget"
      style={currentStyle}
      onSubmitEditing={noop}
      autoFocus={focused}
      name={name}
    />
  );
});

TagInputWidget.propTypes = {
  name: PropTypes.string.isRequired,
  onFocus: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  schema: PropTypes.shape().isRequired,
  uiSchema: PropTypes.shape().isRequired,
  buildNew: PropTypes.func,
  style: StylePropType,
  auto: PropTypes.bool,
  focus: PropTypes.string,
};

TagInputWidget.defaultProps = {
  buildNew: null,
  style: null,
  auto: false,
  focus: null,
};

export default TagInputWidget;
