import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { withTheme } from 'react-native-web-ui-components/Theme';
import Text from 'react-native-web-ui-components/Text';
import StylePropType from 'react-native-web-ui-components/StylePropType';

const styles = StyleSheet.create({
  defaults: {},
  error: {
    color: '#EE2D68',
  },
  label: {
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 5,
  },
});

const LabelWidget = ({
  theme,
  themeTextStyle,
  style,
  hasError,
  label,
  ...props
}) => {
  const currentStyle = [styles.defaults];
  if (label) {
    currentStyle.push(styles.label);
  }
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
  label: PropTypes.bool,
};

LabelWidget.defaultProps = {
  style: null,
  label: false,
};

export default withTheme('LabelWidget')(LabelWidget);
