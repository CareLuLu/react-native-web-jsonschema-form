import React from 'react';
import PropTypes from 'prop-types';
import TextInputWidget from './TextInputWidget';

const TextareaWidget = (props) => {
  const { uiSchema } = props;
  const numberOfLines = (uiSchema['ui:options'] && uiSchema['ui:options'].rows) || 2;
  return <TextInputWidget {...props} multiline numberOfLines={numberOfLines} />;
};

TextareaWidget.propTypes = {
  uiSchema: PropTypes.shape({
    'ui:options': PropTypes.shape({
      rows: PropTypes.number,
    }),
  }).isRequired,
};

export default TextareaWidget;
