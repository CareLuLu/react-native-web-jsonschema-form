import React from 'react';
import { StyleSheet } from 'react-native';
import { get } from 'lodash';
import AbstractField from './AbstractField';

const styles = StyleSheet.create({
  padding: {
    paddingLeft: 10,
  },
});

class BooleanField extends AbstractField {
  getDefaultWidget() {
    const { widgets } = this.props;
    return widgets.HiddenWidget;
  }

  getWidget() {
    const { widgets, uiSchema } = this.props;
    const widgetName = uiSchema['ui:widget'];
    const trueText = get(uiSchema, ['ui:options', 'trueText'], 'Yes');
    const trueValue = get(uiSchema, ['ui:options', 'trueValue'], true);
    const falseText = get(uiSchema, ['ui:options', 'falseText'], 'No');
    const falseValue = get(uiSchema, ['ui:options', 'falseValue'], false);

    let Widget;
    if (!widgetName || widgetName === 'checkbox') {
      const { CheckboxWidget } = widgets;
      Widget = ({ value, ...props }) => (
        <CheckboxWidget {...props} value={trueValue} checked={value === trueValue} />
      );
    } else if (widgetName === 'radio') {
      const { RadioWidget } = widgets;
      Widget = ({ value, style, ...props }) => (
        <React.Fragment>
          <RadioWidget
            {...props}
            text={trueText}
            checked={value === trueValue}
            style={[
              uiSchema['ui:inline'] && uiSchema['ui:title'] !== false ? styles.padding : null,
              style,
            ]}
            value={trueValue}
          />
          <RadioWidget
            {...props}
            text={falseText}
            checked={value === falseValue}
            style={[
              uiSchema['ui:inline'] ? styles.padding : null,
              style,
            ]}
            value={falseValue}
          />
        </React.Fragment>
      );
    }
    return Widget;
  }
}

export default BooleanField;
