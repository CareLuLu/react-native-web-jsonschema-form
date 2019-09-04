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

const Handle = ({ theme, ...props }) => (
  <Link
    {...props}
    auto
    style={styles.handle}
    type={theme.colors.primary}
  />
);

Handle.propTypes = {
  theme: PropTypes.shape().isRequired,
};

export default Handle;
