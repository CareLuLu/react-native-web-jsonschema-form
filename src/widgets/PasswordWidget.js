import React from 'react';
import TextWidget from './TextWidget';

const PasswordWidget = props => (
  <TextWidget {...props} secureTextEntry />
);

export default PasswordWidget;
