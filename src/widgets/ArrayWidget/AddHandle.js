import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-native-web-ui-components/Button';

const AddHandle = ({ theme, onPress, addLabel }) => (
  <Button auto small flat={false} radius type={theme.colors.primary} onPress={onPress}>
    {addLabel}
  </Button>
);

AddHandle.propTypes = {
  theme: PropTypes.shape().isRequired,
  onPress: PropTypes.func.isRequired,
  addLabel: PropTypes.string.isRequired,
};

export default AddHandle;
