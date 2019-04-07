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
    paddingTop: 10,
  },
  hidden: {
    opacity: 0,
    paddingTop: 0,
  },
  xs: {
    paddingTop: 0,
  },
});

const OrderHandle = ({
  handle,
  panHandlers,
  titleOnly,
  screenType,
}) => (
  <View {...(panHandlers || {})}>
    <Text
      className={handle}
      auto
      type="gray"
      style={[
        styles.order,
        screenType === 'xs' ? styles.xs : null,
        titleOnly ? styles.hidden : null,
      ]}
    >
      <Icon name="th" />
    </Text>
  </View>
);

OrderHandle.propTypes = {
  screenType: PropTypes.string.isRequired,
  handle: PropTypes.string.isRequired,
  titleOnly: PropTypes.bool.isRequired,
  panHandlers: PropTypes.shape(),
};

OrderHandle.defaultProps = {
  panHandlers: null,
};

export default OrderHandle;
