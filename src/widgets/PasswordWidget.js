import React from 'react';
import TextInputWidget from './TextInputWidget';

const PasswordWidget = props => (
  <TextInputWidget {...props} secureTextEntry />
);

export default PasswordWidget;
