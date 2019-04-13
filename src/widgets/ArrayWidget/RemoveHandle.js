import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import Text from 'react-native-web-ui-components/Text';
import Link from 'react-native-web-ui-components/Link';

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
  onRemovePress,
  titleOnly,
  screenType,
}) => {
  if (!titleOnly) {
    return (
      <Link
        auto
        type="pink"
        onPress={onRemovePress}
        style={[
          styles.remove,
          titleOnly ? styles.hidden : null,
          screenType === 'xs' ? styles.alignRight : null,
        ]}
      >
        Remove
      </Link>
    );
  }
  return (
    <Text
      auto
      type="pink"
      style={[
        styles.remove,
        titleOnly ? styles.hidden : null,
      ]}
    >
      Remove
    </Text>
  );
};

RemoveHandle.propTypes = {
  onRemovePress: PropTypes.func.isRequired,
  titleOnly: PropTypes.bool.isRequired,
  screenType: PropTypes.string.isRequired,
};

export default RemoveHandle;
