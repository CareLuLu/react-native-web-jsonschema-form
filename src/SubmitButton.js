import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-native-web-ui-components/Button';
import { withTheme } from 'react-native-web-ui-components/Theme';

const SubmitButton = ({ theme, text, onPress }) => (
  <Button
    auto
    className="Form__submitButton"
    flat={false}
    type={theme.colors.primary}
    onPress={onPress}
  >
    {text}
  </Button>
);

SubmitButton.propTypes = {
  theme: PropTypes.shape().isRequired,
  onPress: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

export default withTheme('JsonSchemaFormSubmitButton')(SubmitButton);
