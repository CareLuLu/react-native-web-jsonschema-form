import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-web-ui-components';
import { withTheme } from 'react-native-web-ui-components/Theme';

const styles = StyleSheet.create({
  regular: {
    marginTop: -5,
    fontSize: 12,
  },
  auto: {
    marginTop: 0,
    marginBottom: 0,
  },
  first: {
    marginTop: -10,
  },
  last: {
    marginBottom: 10,
  },
});

const ErrorWidget = ({
  theme,
  children,
  last,
  first,
  auto,
}) => {
  const style = [styles.regular, {
    color: StyleSheet.flatten(theme.input.error.border).borderColor,
  }];
  if (first) {
    style.push(styles.first);
  }
  if (last) {
    style.push(styles.last);
  }
  return (
    <Text style={[style, auto ? styles.auto : null]}>
      {children}
    </Text>
  );
};

ErrorWidget.propTypes = {
  theme: PropTypes.shape().isRequired,
  last: PropTypes.bool,
  first: PropTypes.bool,
  children: PropTypes.node,
  auto: PropTypes.bool,
};

ErrorWidget.defaultProps = {
  last: true,
  first: true,
  children: null,
  auto: false,
};

export default withTheme('ErrorWidget')(ErrorWidget);
