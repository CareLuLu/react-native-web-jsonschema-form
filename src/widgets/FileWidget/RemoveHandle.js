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
});

const RemoveHandle = ({
  theme,
  onRemovePress,
  removeLabel,
  removeStyle,
  ...props
}) => (
  <Link
    {...props}
    auto
    onPress={onRemovePress}
    style={[styles.handle, removeStyle]}
    type={theme.colors.primary}
  >
    {removeLabel}
  </Link>
);

RemoveHandle.propTypes = {
  theme: PropTypes.shape().isRequired,
  onRemovePress: PropTypes.func.isRequired,
  removeLabel: PropTypes.node.isRequired,
  removeStyle: StylePropType,
};

RemoveHandle.defaultProps = {
  removeStyle: null,
};

export default RemoveHandle;
