import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform } from 'react-native';
import View from 'react-native-web-ui-components/View';
import StylePropType from 'react-native-web-ui-components/StylePropType';

const FileArea = ({ onAreaClick, style, children }) => {
  if (Platform.OS === 'web') {
    return React.createElement('div', {
      style: StyleSheet.flatten(style),
      onClick: onAreaClick,
    }, children);
  }
  return (
    <View style={style}>
      {children}
    </View>
  );
};

FileArea.propTypes = {
  onAreaClick: PropTypes.func.isRequired,
  children: PropTypes.node,
  style: StylePropType,
};

FileArea.defaultProps = {
  children: null,
  style: {},
};

export default FileArea;
