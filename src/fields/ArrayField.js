import React from 'react';
import PropTypes from 'prop-types';
import { ucfirst } from '../../utils/string';

class ArrayField extends React.Component {
  static propTypes = {
    cached: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    uiSchema: PropTypes.shape({}).isRequired,
    widgets: PropTypes.shape({}).isRequired,
    fields: PropTypes.shape({}).isRequired,
  };

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
        Widget = widgets.ArrayWidget;
      }
      if (Widget.custom) {
        this.cache = props => <Widget {...props} field={this} />;
      } else {
        const Component = widgetProps => (
          <Widget {...widgetProps} value={widgetProps.formData[name]} />
        );
        const { BaseField } = fields;
        this.cache = props => <BaseField {...props} field={this} widget={Component} />;
      }
    }
    return this.cache({ ...this.props, cached: hasCache });
  }
}

export default ArrayField;
