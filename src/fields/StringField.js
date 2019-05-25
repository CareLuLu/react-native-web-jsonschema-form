import React from 'react';
import { StyleSheet } from 'react-native';
import { isArray, without } from 'lodash';
import AbstractField from './AbstractField';

const styles = StyleSheet.create({
  padding: {
    paddingLeft: 10,
  },
});

const password = /password$/i;
const email = /(email|username)$/i;
const phone = /(phone|mobile|cellphone)$/i;
const message = /(message|text|notes)$/i;
const zip = /zip$/i;

class StringField extends AbstractField {
  getDefaultWidget() {
    const { name, widgets, schema } = this.props;
    let Widget;
    if (schema.format === 'date-time') {
      Widget = widgets.DateWidget;
    } else if (password.test(name)) {
      Widget = widgets.PasswordWidget;
    } else if (email.test(name)) {
      Widget = widgets.EmailWidget;
    } else if (phone.test(name)) {
      Widget = widgets.PhoneWidget;
    } else if (message.test(name)) {
      Widget = widgets.TextareaWidget;
    } else if (zip.test(name)) {
      Widget = widgets.ZipWidget;
    } else {
      Widget = widgets.TextInputWidget;
    }
    return Widget;
  }

  getWidget() {
    const { schema, widgets, uiSchema } = this.props;
    let Widget;
    const widgetName = uiSchema['ui:widget'];
    if (widgetName === 'radioboxes' || widgetName === 'checkboxes') {
      let values = uiSchema['ui:enum'] || schema.enum || [];
      if (isArray(uiSchema['ui:enumExcludes'])) {
        values = without(values, uiSchema['ui:enumExcludes']);
      }
      const labels = uiSchema['ui:enumNames'] || schema.enumNames || values;
      const { RadioWidget, CheckboxWidget } = widgets;
      const BaseWidget = widgetName === 'radioboxes' ? RadioWidget : CheckboxWidget;
      Widget = ({ value, style, ...props }) => (
        <React.Fragment>
          {values.map((trueValue, i) => (
            <BaseWidget
              {...props}
              key={trueValue}
              text={labels[i]}
              checked={value === trueValue}
              style={[
                uiSchema['ui:inline'] && (i > 0 || uiSchema['ui:title'] !== false) ? styles.padding : null,
                style,
              ]}
              value={trueValue}
            />
          ))}
        </React.Fragment>
      );
    }
    return Widget;
  }
}

export default StringField;
