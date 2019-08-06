import React from 'react';
import PropTypes from 'prop-types';
import { Platform } from 'react-native';

const Div = ({ children, ...props }) => {
  if (Platform.OS === 'web') {
    return React.createElement('div', {
      ...props,
      style: { display: 'flex' },
    }, children);
  }
  return children;
};

Div.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Div;
