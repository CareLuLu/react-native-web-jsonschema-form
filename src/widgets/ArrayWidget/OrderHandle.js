import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { View, Text, Icon } from 'react-native-web-ui-components';

const styles = StyleSheet.create({
  order: {
    fontSize: 15,
    textAlign: 'center',
    paddingRight: 10,
  },
  offsetBottom: {
    paddingBottom: 10,
  },
  hidden: {
    opacity: 0,
  },
});

const OrderHandle = ({
  handle,
  uiSchema,
  panHandlers,
  titleOnly,
}) => (
  <View {...(panHandlers || {})}>
    <Text
      className={handle}
      auto
      type="gray"
      style={[
        styles.order,
        titleOnly ? styles.hidden : null,
        uiSchema['ui:inline'] ? null : styles.offsetBottom,
      ]}
    >
      <Icon name="th" />
    </Text>
  </View>
);

OrderHandle.propTypes = {
  handle: PropTypes.string.isRequired,
  uiSchema: PropTypes.shape().isRequired,
  titleOnly: PropTypes.bool.isRequired,
  panHandlers: PropTypes.shape(),
};

OrderHandle.defaultProps = {
  panHandlers: null,
};

export default OrderHandle;
