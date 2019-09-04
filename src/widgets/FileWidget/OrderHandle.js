import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import View from 'react-native-web-ui-components/View';
import Text from 'react-native-web-ui-components/Text';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import Div from '../../Div';

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
  orderLabel,
  orderStyle,
}) => (
  <View {...(panHandlers || {})}>
    <Div className={handle}>
      <Text
        className={handle}
        auto
        type="gray"
        style={[styles.order, orderStyle]}
      >
        {orderLabel}
      </Text>
    </Div>
  </View>
);

OrderHandle.propTypes = {
  handle: PropTypes.string.isRequired,
  orderLabel: PropTypes.node.isRequired,
  panHandlers: PropTypes.shape(),
  orderStyle: StylePropType,
};

OrderHandle.defaultProps = {
  panHandlers: null,
  orderStyle: null,
};

export default OrderHandle;
