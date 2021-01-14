import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import Link from 'react-native-web-ui-components/Link';
import StylePropType from 'react-native-web-ui-components/StylePropType';

const styles = StyleSheet.create({
  handle: {
    paddingLeft: 10,
    paddingTop: 11,
  },
  fullWidth: {
    width: '100%',
  },
});

const RemoveHandle = ({
  theme,
  auto,
  onRemovePress,
  removeLabel,
  removeStyle,
  ...props
}) => (
  <Link
    {...props}
    auto={auto}
    onPress={onRemovePress}
    style={[
      styles.handle,
      auto ? null : styles.fullWidth,
      removeStyle,
    ]}
    type={theme.colors.primary}
  >
    {removeLabel}
  </Link>
);

RemoveHandle.propTypes = {
  auto: PropTypes.bool,
  theme: PropTypes.shape().isRequired,
  onRemovePress: PropTypes.func.isRequired,
  removeLabel: PropTypes.node.isRequired,
  removeStyle: StylePropType,
};

RemoveHandle.defaultProps = {
  removeStyle: null,
  auto: false,
};

export default RemoveHandle;
