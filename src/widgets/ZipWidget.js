import React from 'react';
import TextWidget from './TextWidget';

const ZipWidget = props => (
  <TextWidget {...props} keyboardType="number-pad" mask="99999" />
);

export default ZipWidget;
