import React from 'react';
import { isNumber } from 'lodash';
import TextInputWidget from './TextInputWidget';

const textParser = (value) => {
  const result = parseInt(value, 10);
  return isNumber(result) ? result : null;
};

const IntegerWidget = props => (
  <TextInputWidget {...props} keyboardType="number-pad" mask="9999999999" textParser={textParser} />
);

export default IntegerWidget;
