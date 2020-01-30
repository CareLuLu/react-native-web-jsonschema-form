import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { noop, pick, isFunction } from 'lodash';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import RNTagInput from 'react-native-web-ui-components/TagInput';
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
  'items',
  'isMatch',
  'text',
  'tagStyle',
  'inputStyle',
  'menuStyle',
  'itemStyle',
  'allowNew',
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

const useBuildNew = ({ schema, buildNew }) => (text) => {
  if (isFunction(buildNew)) {
    return buildNew(text);
  }
  if (schema.items.type === 'object') {
    const [attribute] = Object.keys(schema.items.properties);
    const { type } = schema.items.properties[attribute];
    return { [attribute]: parseValue(type, text) };
  }
  return parseValue(schema.items.type, text);
};

const useGetItemValue = ({ schema, getItemValue }) => (item) => {
  if (isFunction(getItemValue)) {
    return getItemValue(item);
  }
  if (schema.items.type === 'object') {
    const [attribute] = Object.keys(schema.items.properties);
    return item[attribute];
  }
  return item;
};

const TagInputWidget = (props) => {
  const {
    auto,
    name,
    style,
    schema,
    uiSchema,
    ...nextProps
  } = props;

  const autoFocusParams = useAutoFocus(props);
  const onChange = useOnChange(props);
  const buildNew = useBuildNew(props);
  const getItemValue = useGetItemValue(props);

  if (schema.type !== 'array') {
    throw new Error('TagInputWidget can only be used with arrays.');
  }

  const currentStyle = [
    styles.defaults,
    auto ? styles.auto : styles.fullWidth,
    style,
  ];

  return (
    <RNTagInput
      {...pick(nextProps, allowedAttributes)}
      {...autoFocusParams}
      autoCapitalize="none"
      className="TagInput__widget"
      style={currentStyle}
      onSubmitEditing={noop}
      name={name}
      onChange={onChange}
      buildNew={buildNew}
      getItemValue={getItemValue}
    />
  );
};

TagInputWidget.hideable = false;

TagInputWidget.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  schema: PropTypes.shape().isRequired,
  uiSchema: PropTypes.shape().isRequired,
  buildNew: PropTypes.func,
  style: StylePropType,
  auto: PropTypes.bool,
};

TagInputWidget.defaultProps = {
  buildNew: null,
  style: null,
  auto: false,
};

export default TagInputWidget;
