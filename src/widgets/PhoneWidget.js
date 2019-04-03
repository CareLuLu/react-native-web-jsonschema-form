import React from 'react';
import TextWidget from './TextWidget';
import { toPhone } from '../../utils/string';

const isComplete = /^[0-9]{10}$/;

const PhoneWidget = (props) => {
  const { value, name, onChange } = props;
  if (isComplete.test(value || '')) {
    setTimeout(() => onChange(toPhone(value), name, true));
  }
  return <TextWidget {...props} keyboardType="number-pad" mask="(999) 999-9999" />;
};

export default PhoneWidget;
