import React from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { last, isArray } from 'lodash';
import Row from 'react-native-web-ui-components/Row';
import {
  getComponent,
  getTitle,
  FIELD_TITLE,
  toPath,
} from '../utils';

const styles = StyleSheet.create({
  field: {},
  fieldInline: {
    alignItems: 'center',
    paddingBottom: 10,
  },
});

class AbstractField extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    update: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape(),
    ]).isRequired,
    schema: PropTypes.shape().isRequired,
    uiSchema: PropTypes.shape().isRequired,
    clearCache: PropTypes.bool.isRequired,
    widgets: PropTypes.shape().isRequired,
    required: PropTypes.shape().isRequired,
    noTitle: PropTypes.bool,
    titleOnly: PropTypes.bool,
    zIndex: PropTypes.number,
    errors: PropTypes.any, // eslint-disable-line
    value: PropTypes.any, // eslint-disable-line
  };

  static defaultProps = {
    noTitle: false,
    titleOnly: false,
    errors: {},
    value: undefined,
    zIndex: 0,
  };

  shouldComponentUpdate(nextProps) {
    const { clearCache, update, name } = nextProps;
    return name === '' || clearCache || update === 'all' || update[name] || false;
  }

  getDefaultWidget() { // eslint-disable-line
    throw new Error('Abstract field cannot be used.');
  }

  renderErrors() {
    const {
      errors,
      widgets,
      uiSchema,
    } = this.props;
    const { ErrorWidget } = widgets;
    return errors.map((error, i) => (
      <ErrorWidget
        uiSchema={uiSchema}
        key={error}
        first={i === 0}
        last={i === errors.length - 1}
        auto={uiSchema['ui:inline']}
        {...(uiSchema['ui:errorProps'] || {})}
      >
        {error}
      </ErrorWidget>
    ));
  }

  renderTitle(hasError, params) {
    const {
      name,
      widgets,
      schema,
      uiSchema,
      noTitle,
      required,
    } = this.props;
    if (
      noTitle
      || uiSchema['ui:title'] === false
      || schema.type === 'object'
      || schema.type === 'array'
    ) {
      return null;
    }
    const { LabelWidget } = widgets;
    let title = getTitle(uiSchema['ui:title'] || FIELD_TITLE, params);
    if (required[toPath(name, '[]')]) {
      title += '*';
    }
    return (
      <LabelWidget hasError={hasError} auto={uiSchema['ui:inline']} {...(uiSchema['ui:titleProps'] || {})}>
        {title}
      </LabelWidget>
    );
  }

  render() {
    const {
      id,
      name,
      schema,
      uiSchema,
      widgets,
      errors,
      value,
      titleOnly,
      zIndex,
    } = this.props;
    let Widget;
    if (this.getWidget) {
      Widget = this.getWidget(this.props);
    } else {
      Widget = getComponent(uiSchema['ui:widget'], 'Widget', widgets);
    }
    if (!Widget) {
      Widget = this.getDefaultWidget(this.props);
    }
    const hasError = (
      schema.type !== 'object'
      && schema.type !== 'array'
      && isArray(errors)
      && errors.length > 0
      && !errors.hidden
    );
    if (hasError && errors.lastValue === undefined) {
      errors.lastValue = value;
    }
    if (Widget.custom) {
      return <Widget {...this.props} hasError={hasError} />;
    }

    const containerProps = uiSchema['ui:container'] || {};
    if (uiSchema['ui:widget'] === 'hidden') {
      if (!hasError) {
        return null;
      }
      // Show errors for hidden fields
      return (
        <Row xs={12} {...containerProps} hasError={hasError}>
          {this.renderErrors()}
        </Row>
      );
    }
    const key = last(name.split('.'));
    const params = {
      key,
      name,
      value,
    };
    const placeholder = getTitle(uiSchema['ui:placeholder'] || '', params);
    const fieldClassName = schema.type !== 'object' && schema.type !== 'array' ? `${id}-field` : '';
    return (
      <Row
        xs={12}
        {...containerProps}
        className={`${fieldClassName} ${containerProps.className || ''}`}
        hasError={hasError}
        style={[
          uiSchema['ui:inline'] ? styles.fieldInline : styles.field,
          containerProps.style || {},
          { zIndex },
        ]}
      >
        {this.renderTitle(hasError, params)}
        {!titleOnly || schema.type === 'object' || schema.type === 'array' ? (
          <React.Fragment>
            <Widget
              {...this.props}
              auto={uiSchema['ui:inline']}
              hasError={hasError}
              placeholder={placeholder}
              disabled={!!uiSchema['ui:disabled']}
              readonly={!!uiSchema['ui:readonly']}
              {...(uiSchema['ui:widgetProps'] || {})}
            />
            {hasError ? this.renderErrors() : null}
          </React.Fragment>
        ) : null}
      </Row>
    );
  }
}

export default AbstractField;
