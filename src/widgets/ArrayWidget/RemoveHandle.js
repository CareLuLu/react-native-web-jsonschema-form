import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { Text, Link } from 'react-native-web-ui-components';

const styles = StyleSheet.create({
  remove: {
    paddingLeft: 10,
  },
  offsetBottom: {
    paddingBottom: 10,
  },
  hidden: {
    opacity: 0,
  },
  alignRight: {
    width: '100%',
    textAlign: 'right',
  },
});

const RemoveHandle = ({
  onRemovePress,
  uiSchema,
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
          uiSchema['ui:inline'] ? null : styles.offsetBottom,
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
        uiSchema['ui:inline'] ? null : styles.offsetBottom,
      ]}
    >
      Remove
    </Text>
  );
};

RemoveHandle.propTypes = {
  onRemovePress: PropTypes.func.isRequired,
  uiSchema: PropTypes.shape().isRequired,
  titleOnly: PropTypes.bool.isRequired,
  screenType: PropTypes.string.isRequired,
};

export default RemoveHandle;
