import React from 'react';
import PropTypes from 'prop-types';
import { withHandlers } from 'recompact';
import { pick, isFunction } from 'lodash';
import Autocomplete from 'react-native-web-ui-components/Autocomplete';
import TextInputWidget from './TextInputWidget';

const allowedAttributes = [
  'items',
  'getItemValue',
  'onSelect',
  'isMatch',
  'Item',
  'Input',
  'Menu',
];

const AutocompleteWidget = withHandlers({
  onSelect: ({ onChange, onSelect, name }) => (value) => {
    if (isFunction(onSelect)) {
      return onSelect(value);
    }
    return onChange(value, name);
  },
})(props => (
  <TextInputWidget
    {...props}
    Input={Autocomplete}
    inputProps={pick(props, allowedAttributes)}
  />
));

AutocompleteWidget.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default AutocompleteWidget;