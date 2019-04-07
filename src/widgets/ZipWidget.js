import React from 'react';
import PropTypes from 'prop-types';
import TextWidget from './TextWidget';

const ZipWidget = props => <TextWidget {...props} />;

ZipWidget.propTypes = {
  mask: PropTypes.string,
  keyboardType: PropTypes.string,
};

ZipWidget.defaultProps = {
  mask: '99999',
  keyboardType: 'number-pad',
};

export default ZipWidget;
