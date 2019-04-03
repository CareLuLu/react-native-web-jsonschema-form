import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { get, indexOf } from 'lodash';
import { ucfirst } from '../../utils/string';

const styles = StyleSheet.create({
  padding: {
    paddingLeft: 10,
  },
});

class BooleanField extends React.Component {
  static propTypes = {
    cached: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    uiSchema: PropTypes.shape({}).isRequired,
    widgets: PropTypes.shape({}).isRequired,
    fields: PropTypes.shape({}).isRequired,
  };

  shouldComponentUpdate(nextProps) {
    return nextProps.update === 'all' || indexOf(nextProps.update, nextProps.name) >= 0;
  }

  render() {
    const {
      cached,
      name,
      uiSchema,
      widgets,
      fields,
    } = this.props;
    const hasCache = !!(cached && this.cache);
    if (!hasCache) {
      let Widget = widgets[`${ucfirst(uiSchema['ui:widget'])}Widget`];
      if (!Widget) {
        Widget = widgets.CheckboxWidget;
      }
      let Component;
      if (Widget === widgets.CheckboxWidget) {
        Component = widgetProps => (
          <Widget {...widgetProps} value checked={!!widgetProps.formData[name]} />
        );
      } else if (Widget === widgets.RadioWidget) {
        Component = widgetProps => (
          <React.Fragment>
            <Widget
              {...widgetProps}
              text={get(uiSchema, ['ui:options', 'trueText'], 'Yes')}
              checked={widgetProps.formData[name] === true}
              style={[
                !uiSchema['ui:inline'] || uiSchema['ui:title'] !== false ? styles.padding : null,
                widgetProps.style,
              ]}
              value
            />
            <Widget
              {...widgetProps}
              text={get(uiSchema, ['ui:options', 'falseText'], 'No')}
              checked={widgetProps.formData[name] === false}
              style={[
                styles.padding,
                widgetProps.style,
              ]}
              value={false}
            />
          </React.Fragment>
        );
      } else {
        Component = widgetProps => (
          <Widget {...widgetProps} value={widgetProps.formData[name]} />
        );
      }
      const { BaseField } = fields;
      this.cache = props => <BaseField {...props} field={this} widget={Component} />;
    }
    return this.cache({ ...this.props, cached: hasCache });
  }
}

export default BooleanField;
