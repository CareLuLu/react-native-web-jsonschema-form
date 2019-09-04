import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import Text from 'react-native-web-ui-components/Text';
import Link from 'react-native-web-ui-components/Link';
import StylePropType from 'react-native-web-ui-components/StylePropType';

const styles = StyleSheet.create({
  remove: {
    paddingLeft: 10,
    paddingTop: 11,
  },
  hidden: {
    opacity: 0,
    paddingTop: 0,
  },
  alignRight: {
    paddingTop: 0,
    width: '100%',
    textAlign: 'right',
  },
});

const RemoveHandle = ({
  theme,
  onRemovePress,
  titleOnly,
  screenType,
  removeLabel,
  removeStyle,
}) => {
  if (!titleOnly) {
    return (
      <Link
        auto
        type={theme.colors.primary}
        onPress={onRemovePress}
        style={[
          styles.remove,
          titleOnly ? styles.hidden : null,
          screenType === 'xs' ? styles.alignRight : null,
          removeStyle,
        ]}
      >
        {removeLabel}
      </Link>
    );
  }
  return (
    <Text
      auto
      type={theme.colors.primary}
      style={[
        styles.remove,
        titleOnly ? styles.hidden : null,
      ]}
    >
      {removeLabel}
    </Text>
  );
};

RemoveHandle.propTypes = {
  theme: PropTypes.shape().isRequired,
  onRemovePress: PropTypes.func.isRequired,
  titleOnly: PropTypes.bool.isRequired,
  screenType: PropTypes.string.isRequired,
  removeLabel: PropTypes.node.isRequired,
  removeStyle: StylePropType,
};

RemoveHandle.defaultProps = {
  removeStyle: null,
};

export default RemoveHandle;
