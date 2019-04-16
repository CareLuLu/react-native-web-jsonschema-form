import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import View from 'react-native-web-ui-components/View';
import Text from 'react-native-web-ui-components/Text';
import Icon from 'react-native-web-ui-components/Icon';

const styles = StyleSheet.create({
  order: {
    fontSize: 15,
    textAlign: 'center',
    paddingRight: 10,
    paddingTop: 11,
    lineHeight: 23,
  },
});

const OrderHandle = ({
  handle,
  panHandlers,
}) => (
  <View {...(panHandlers || {})}>
    <Text
      className={handle}
      auto
      type="gray"
      style={styles.order}
    >
      <Icon name="th" />
    </Text>
  </View>
);

OrderHandle.propTypes = {
  handle: PropTypes.string.isRequired,
  panHandlers: PropTypes.shape(),
};

OrderHandle.defaultProps = {
  panHandlers: null,
};

export default OrderHandle;
