import React from 'react';
import TextInputWidget from './TextInputWidget';

const textParser = value => (parseInt(value, 10) || null);

const IntegerWidget = props => (
  <TextInputWidget {...props} keyboardType="number-pad" mask="9999999999" textParser={textParser} />
);

export default IntegerWidget;
