import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { pick, isFunction } from 'lodash';
import Autocomplete from 'react-native-web-ui-components/Autocomplete';
import TextInputWidget from './TextInputWidget';

const allowedAttributes = [
  'allowEmpty',
  'items',
  'getItemValue',
  'onSelect',
  'isMatch',
  'Item',
  'Input',
  'inputStyle',
  'Menu',
  'menuStyle',
  'menuVisibleWhenFocused',
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

const useOnSelect = ({
  name,
  onChange,
  onSelect,
  setText,
}) => (value, item) => {
  setText.current(value);
  if (isFunction(onSelect)) {
    onSelect(value, item);
  }
  return onChange(value, name);
};

const AutocompleteWidget = (props) => {
  const setText = useRef();
  const onSelect = useOnSelect({ ...props, setText });

  const register = (fn) => { setText.current = fn; };

  const inputProps = {
    ...pick(props, allowedAttributes),
    onSelect,
    autoCapitalize: 'none',
  };

  return (
    <TextInputWidget
      {...props}
      changeOnBlur={false}
      register={register}
      onSelect={onSelect}
      Input={Autocomplete}
      inputProps={inputProps}
    />
  );
};

AutocompleteWidget.hideable = false;

AutocompleteWidget.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default AutocompleteWidget;
