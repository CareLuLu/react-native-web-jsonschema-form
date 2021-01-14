import React from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { last, isArray, isString } from 'lodash';
import Row from 'react-native-web-ui-components/Row';
import View from 'react-native-web-ui-components/View';
import {
  getComponent,
  getTitle,
  getTitleFormat,
  toPath,
} from '../utils';
import ArrayWidget from '../widgets/ArrayWidget';

const styles = StyleSheet.create({
  field: {},
  fieldInline: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  container: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
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
    meta: PropTypes.any, // eslint-disable-line
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
    let { errors } = this.props;
    const { widgets, uiSchema } = this.props;

    const { ErrorWidget } = widgets;

    errors = errors.filter(error => isString(error));
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
      id,
      name,
      widgets,
      schema,
      uiSchema,
      noTitle,
      required,
    } = this.props;

    const titleFormat = getTitleFormat(schema, uiSchema);

    const hasTitle = !(
      noTitle
      || titleFormat === false
      || this.cache === ArrayWidget
    );
    if (!uiSchema['ui:toggleable'] && !hasTitle) {
      return null;
    }
    const { LabelWidget } = widgets;
    let title = getTitle(titleFormat, params);
    if (required[toPath(name, '[]')]) {
      title += '*';
    }
    return (
      <LabelWidget
        {...this.props}
        className={`${id}-title ${id}-title-${name.replace(/\./g, '-')}`}
        toggleable={!!uiSchema['ui:toggleable']}
        hasTitle={hasTitle}
        hasError={hasError}
        auto={uiSchema['ui:inline']}
        {...(uiSchema['ui:titleProps'] || {})}
      >
        {title}
      </LabelWidget>
    );
  }

  render() {
    const {
      id,
      name,
      meta,
      schema,
      uiSchema,
      widgets,
      errors,
      value,
      titleOnly,
      zIndex,
      clearCache,
    } = this.props;

    if (clearCache) {
      this.cache = null;
    }
    if (!this.cache) {
      if (this.getWidget) {
        this.cache = this.getWidget(this.props);
      }
      if (!this.cache) {
        this.cache = getComponent(uiSchema['ui:widget'], 'Widget', widgets);
      }
      if (!this.cache) {
        this.cache = this.getDefaultWidget(this.props);
      }
    }
    const Widget = this.cache;
    const hasError = (
      schema.type !== 'object'
      && (schema.type !== 'array' || Widget.hideable === false)
      && isArray(errors)
      && errors.length > 0
      && (!errors.hidden || Widget.hideable === false)
    );
    if (hasError && errors.lastValue === undefined) {
      errors.lastValue = value;
    }
    if (Widget.custom) {
      return <Widget {...this.props} hasError={hasError} />;
    }

    const containerProps = uiSchema['ui:containerProps'] || {};
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
    const fieldClassName = schema.type !== 'object' && Widget !== ArrayWidget
      ? `${id}-field ${id}-field-${name.replace(/\./g, '-')}`
      : '';
    return (
      <View
        {...containerProps}
        className={`${fieldClassName} ${containerProps.className || ''}`}
        hasError={hasError}
        style={[
          styles.container,
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
              style={null}
              auto={uiSchema['ui:inline']}
              hasError={hasError}
              placeholder={placeholder}
              disabled={!!(meta && meta['ui:disabled'])}
              readonly={!!uiSchema['ui:readonly']}
              {...(uiSchema['ui:widgetProps'] || {})}
            />
            {hasError ? this.renderErrors() : null}
          </React.Fragment>
        ) : null}
      </View>
    );
  }
}

export default AbstractField;
