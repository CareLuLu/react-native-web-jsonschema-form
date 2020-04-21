import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import Link from 'react-native-web-ui-components/Link';

const styles = StyleSheet.create({
  handle: {
    paddingRight: 10,
    paddingTop: 6,
  },
  fullWidth: {
    width: '100%',
  },
});

const UploadHandle = ({
  theme,
  auto,
  onUploadPress,
  uploadLabel,
  uploadStyle,
  ...props
}) => (
  <Link
    {...props}
    auto={auto}
    onPress={onUploadPress}
    style={[
      styles.handle,
      auto ? null : styles.fullWidth,
      uploadStyle,
    ]}
    type={theme.colors.primary}
  >
    {uploadLabel}
  </Link>
);

UploadHandle.propTypes = {
  auto: PropTypes.bool.isRequired,
  theme: PropTypes.shape().isRequired,
  onUploadPress: PropTypes.func.isRequired,
  uploadLabel: PropTypes.node.isRequired,
  uploadStyle: StylePropType,
};

UploadHandle.defaultProps = {
  uploadStyle: null,
};

export default UploadHandle;
