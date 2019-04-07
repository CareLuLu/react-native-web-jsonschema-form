import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-native-web-ui-components/Button';
import { withTheme } from 'react-native-web-ui-components/Theme';

const CancelButton = ({ text, onPress }) => (
  <Button
    auto
    className="Form__cancelButton"
    flat={false}
    type="white"
    onPress={onPress}
  >
    {text}
  </Button>
);

CancelButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

export default withTheme('JsonSchemaFormCancelButton')(CancelButton);
