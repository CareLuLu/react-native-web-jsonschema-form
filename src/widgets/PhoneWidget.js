import React from 'react';
import PropTypes from 'prop-types';
import TextInputWidget from './TextInputWidget';

const defaultMaskParser = (value) => {
  const text = (value === null || value === undefined) ? '' : `${value}`;
  return text.replace(/[^0-9]/g, '');
};

const PhoneWidget = props => <TextInputWidget {...props} />;

PhoneWidget.propTypes = {
  mask: PropTypes.string,
  keyboardType: PropTypes.string,
  maskParser: PropTypes.func,
};

PhoneWidget.defaultProps = {
  mask: '(999) 999-9999',
  keyboardType: 'number-pad',
  maskParser: defaultMaskParser,
};

export default PhoneWidget;
