import React from 'react';
import PropTypes from 'prop-types';
import { indexOf } from 'lodash';
import { ucfirst } from '../../utils/string';

const PASSWORD = /password$/i;
const EMAIL = /(email|username)$/i;
const PHONE = /(phone|mobile|cellphone)$/i;
const MESSAGE = /(message|text|notes)$/i;
const ZIP = /zip$/i;

class StringField extends React.Component {
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
      schema,
      widgets,
      fields,
    } = this.props;
    const hasCache = !!(cached && this.cache);
    if (!hasCache) {
      let Widget = widgets[`${ucfirst(uiSchema['ui:widget'])}Widget`];
      if (!Widget) {
        if (schema.format === 'date-time') {
          Widget = widgets.DateWidget;
        } else if (PASSWORD.test(name)) {
          Widget = widgets.PasswordWidget;
        } else if (EMAIL.test(name)) {
          Widget = widgets.EmailWidget;
        } else if (PHONE.test(name)) {
          Widget = widgets.PhoneWidget;
        } else if (MESSAGE.test(name)) {
          Widget = widgets.TextareaWidget;
        } else if (ZIP.test(name)) {
          Widget = widgets.ZipWidget;
        } else {
          Widget = widgets.TextWidget;
        }
      }
      const Component = widgetProps => (
        <Widget {...widgetProps} value={widgetProps.formData[name]} />
      );
      const { BaseField } = fields;
      this.cache = props => <BaseField {...props} field={this} widget={Component} />;
    }
    return this.cache({ ...this.props, cached: hasCache });
  }
}

export default StringField;
