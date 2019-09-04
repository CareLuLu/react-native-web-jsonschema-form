import React from 'react';
import PropTypes from 'prop-types';
import TextInputWidget from './TextInputWidget';

const PhoneWidget = props => <TextInputWidget {...props} />;

PhoneWidget.propTypes = {
  mask: PropTypes.string,
  keyboardType: PropTypes.string,
};

PhoneWidget.defaultProps = {
  mask: '(999) 999-9999',
  keyboardType: 'number-pad',
};

export default PhoneWidget;
