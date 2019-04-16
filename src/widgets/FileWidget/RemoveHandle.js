import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import Link from 'react-native-web-ui-components/Link';

const styles = StyleSheet.create({
  handle: {
    paddingLeft: 10,
    paddingTop: 11,
  },
});

const RemoveHandle = ({ theme, onRemovePress, ...props }) => (
  <Link
    {...props}
    auto
    onPress={onRemovePress}
    style={styles.handle}
    type={theme.colors.primary}
  >
    Remove
  </Link>
);

RemoveHandle.propTypes = {
  theme: PropTypes.shape().isRequired,
  onRemovePress: PropTypes.func.isRequired,
};

export default RemoveHandle;
