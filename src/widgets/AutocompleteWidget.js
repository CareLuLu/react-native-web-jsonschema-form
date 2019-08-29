import React from 'react';
import PropTypes from 'prop-types';
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
  'menuStyle',
  'itemHeight',
  'itemProps',
  'itemStyle',
  'Spinner',
  'spinnerHeight',
  'EmptyResult',
  'emptyResultHeight',
  'throttleDelay',
  'debounceDelay',
  'throttleDebounceThreshold',
];

const useOnSelect = ({ onChange, onSelect, name }) => (value, item) => {
  if (isFunction(onSelect)) {
    onSelect(value, item);
  }
  return onChange(value, name);
};

const AutocompleteWidget = (props) => {
  const onSelect = useOnSelect(props);

  return (
    <TextInputWidget
      {...props}
      onSelect={onSelect}
      Input={Autocomplete}
      inputProps={pick(props, allowedAttributes)}
    />
  );
};

AutocompleteWidget.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default AutocompleteWidget;
