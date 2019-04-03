import React from 'react';
import TextWidget from './TextWidget';

const EmailWidget = props => (
  <TextWidget {...props} keyboardType="email-address" />
);

export default EmailWidget;
