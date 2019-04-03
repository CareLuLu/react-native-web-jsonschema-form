import React from 'react';
import TextWidget from './TextWidget';

const IntegerWidget = props => (
  <TextWidget {...props} keyboardType="number-pad" mask="9999999999" />
);

export default IntegerWidget;
