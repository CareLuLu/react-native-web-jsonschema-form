import React from 'react';
import PropTypes from 'prop-types';
import TextWidget from './TextWidget';

const TextareaWidget = (props) => {
  const { uiSchema } = props;
  const numberOfLines = (uiSchema['ui:options'] && uiSchema['ui:options'].rows) || 2;
  return <TextWidget {...props} multiline numberOfLines={numberOfLines} />;
};

TextareaWidget.propTypes = {
  uiSchema: PropTypes.shape({}).isRequired,
};

export default TextareaWidget;
