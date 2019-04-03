import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { withTheme } from 'react-native-web-ui-components/Theme';
import { Text, StylePropType } from 'react-native-web-ui-components';

const styles = StyleSheet.create({
  defaults: {},
  error: {
    color: '#EE2D68',
  },
});

const LabelWidget = ({
  theme,
  themeTextStyle,
  style,
  hasError,
  ...props
}) => {
  const currentStyle = [styles.defaults];
  if (hasError) {
    currentStyle.push({ color: StyleSheet.flatten(theme.input.error.border).borderColor });
  } else {
    currentStyle.push(themeTextStyle.text);
  }
  currentStyle.push(style);
  return <Text {...props} style={currentStyle} />;
};

LabelWidget.propTypes = {
  theme: PropTypes.shape().isRequired,
  themeTextStyle: PropTypes.shape().isRequired,
  hasError: PropTypes.bool.isRequired,
  style: StylePropType,
};

LabelWidget.defaultProps = {
  style: null,
};

export default withTheme('LabelWidget')(LabelWidget);
