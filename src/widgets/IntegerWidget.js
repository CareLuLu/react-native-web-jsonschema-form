import React from 'react';
import { isNaN } from 'lodash';
import TextInputWidget from './TextInputWidget';

const textParser = (value) => {
  const result = parseInt(value, 10);
  return isNaN(result) ? result : null;
};

const IntegerWidget = props => (
  <TextInputWidget {...props} keyboardType="number-pad" mask="9999999999" textParser={textParser} />
);

export default IntegerWidget;
