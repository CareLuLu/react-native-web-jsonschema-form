import React from 'react';
import TextWidget from './TextWidget';

const textParser = value => (parseInt(value, 10) || null);

const IntegerWidget = props => (
  <TextWidget {...props} keyboardType="number-pad" mask="9999999999" textParser={textParser} />
);

export default IntegerWidget;
