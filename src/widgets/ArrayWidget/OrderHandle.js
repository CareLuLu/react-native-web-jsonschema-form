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
  hidden: {
    opacity: 0,
    paddingTop: 0,
  },
  xs: {
    paddingTop: 0,
  },
});

const OrderHandle = ({
  theme,
  handle,
  panHandlers,
  titleOnly,
  screenType,
  orderLabel,
  orderStyle,
}) => (
  <View {...(panHandlers || {})}>
    <Div className={handle}>
      <Text
        className={handle}
        auto
        type={theme.colors.text}
        style={[
          styles.order,
          screenType === 'xs' ? styles.xs : null,
          titleOnly ? styles.hidden : null,
          orderStyle,
        ]}
      >
        {orderLabel}
      </Text>
    </Div>
  </View>
);

OrderHandle.propTypes = {
  theme: PropTypes.shape().isRequired,
  screenType: PropTypes.string.isRequired,
  handle: PropTypes.string.isRequired,
  titleOnly: PropTypes.bool.isRequired,
  panHandlers: PropTypes.shape(),
  orderLabel: PropTypes.node.isRequired,
  orderStyle: StylePropType,
};

OrderHandle.defaultProps = {
  panHandlers: null,
  orderStyle: null,
};

export default OrderHandle;
