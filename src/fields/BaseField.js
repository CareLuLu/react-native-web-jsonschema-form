import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { last, isArray } from 'lodash';
import { Row } from 'react-native-web-ui-components';

/* eslint react/no-array-index-key: 0 */

const styles = StyleSheet.create({
  zIndex: {
    zIndex: 1,
  },
  field: {},
  fieldInline: {
    alignItems: 'center',
    paddingBottom: 10,
  },
});

const BaseField = (props) => {
  const {
    name,
    schema,
    uiSchema,
    errorSchema,
    options,
    widget,
    widgets,
    formData,
    castValue,
    formatExpression,
    zIndex,
    noTitle,
    titleOnly,
  } = props;
  const key = last(name.split('.'));
  const value = castValue(formData[name], schema);
  const expressionOptions = {
    key,
    name,
    value,
  };
  const title = `${formatExpression(uiSchema['ui:title'] || '%title%', expressionOptions)}${name in options.required ? '*' : ''}`;
  const placeholder = formatExpression(uiSchema['ui:placeholder'] || '', expressionOptions);
  const { LabelWidget, ErrorWidget } = widgets;
  const Widget = widget;
  const hasError = (
    schema.type !== 'object'
    && schema.type !== 'array'
    && isArray(errorSchema)
    && errorSchema.length
    && !errorSchema.hidden
  );
  errorSchema.tagged = true;
  if (hasError && errorSchema.lastValue === undefined) {
    errorSchema.lastValue = value;
  }
  const containerProps = uiSchema['ui:container'] || {};
  if (uiSchema['ui:widget'] === 'hidden') {
    if (!hasError) {
      return null;
    }
    return (
      <Row xs={12} {...containerProps} hasError={hasError}>
        {errorSchema.map((error, i) => (
          <ErrorWidget
            uiSchema={uiSchema}
            key={`error-${name}-${i}`}
            first={i === 0}
            last={i === errorSchema.length - 1}
            auto={uiSchema['ui:inline']}
            {...(uiSchema['ui:errorProps'] || {})}
          >
            {error}
          </ErrorWidget>
        ))}
      </Row>
    );
  }
  return (
    <Row
      xs={12}
      {...containerProps}
      hasError={hasError}
      style={[
        uiSchema['ui:inline'] ? styles.fieldInline : styles.field,
        { zIndex },
        containerProps.style || {},
      ]}
    >
      {!noTitle && uiSchema['ui:title'] !== false && schema.type !== 'object' && schema.type !== 'array' ? (
        <LabelWidget hasError={hasError} auto={uiSchema['ui:inline']} {...(uiSchema['ui:titleProps'] || {})}>
          {title}
        </LabelWidget>
      ) : null}
      {!titleOnly || schema.type === 'object' || schema.type === 'array' ? (
        <React.Fragment>
          <Widget
            {...props}
            auto={uiSchema['ui:inline']}
            hasError={hasError}
            placeholder={placeholder}
            {...(uiSchema['ui:widgetProps'] || {})}
          />
          {hasError ? errorSchema.map((error, i) => (
            <ErrorWidget
              key={`error-${name}-${i}`}
              first={i === 0}
              last={i === errorSchema.length - 1}
              auto={uiSchema['ui:inline']}
              {...(uiSchema['ui:errorProps'] || {})}
            >
              {error}
            </ErrorWidget>
          )) : null}
        </React.Fragment>
      ) : null}
    </Row>
  );
};

BaseField.propTypes = {
  name: PropTypes.string.isRequired,
  castValue: PropTypes.func.isRequired,
  formatExpression: PropTypes.func.isRequired,
  schema: PropTypes.shape({}).isRequired,
  formData: PropTypes.shape({}).isRequired,
  uiSchema: PropTypes.shape({}).isRequired,
  errorSchema: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.shape(),
  ]).isRequired,
  options: PropTypes.shape({}).isRequired,
  widget: PropTypes.func.isRequired,
  widgets: PropTypes.shape({}).isRequired,
  zIndex: PropTypes.number.isRequired,
  noTitle: PropTypes.bool,
  titleOnly: PropTypes.bool,
};

BaseField.defaultProps = {
  noTitle: false,
  titleOnly: false,
};

export default BaseField;
