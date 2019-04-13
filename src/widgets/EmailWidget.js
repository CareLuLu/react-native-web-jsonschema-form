import React from 'react';
import TextInputWidget from './TextInputWidget';

const EmailWidget = props => (
  <TextInputWidget {...props} keyboardType="email-address" />
);

export default EmailWidget;
