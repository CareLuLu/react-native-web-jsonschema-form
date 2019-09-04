import React from 'react';
import PropTypes from 'prop-types';
import TextInputWidget from './TextInputWidget';

const ZipWidget = props => <TextInputWidget {...props} />;

ZipWidget.propTypes = {
  mask: PropTypes.string,
  keyboardType: PropTypes.string,
};

ZipWidget.defaultProps = {
  mask: '99999',
  keyboardType: 'number-pad',
};

export default ZipWidget;
