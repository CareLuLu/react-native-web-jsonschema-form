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

    let Widget;
    if (!widgetName || widgetName === 'checkbox') {
      const { CheckboxWidget } = widgets;
      Widget = ({ value, ...props }) => <CheckboxWidget {...props} value checked={!!value} />;
    } else if (widgetName === 'radio') {
      const { RadioWidget } = widgets;
      Widget = ({ value, style, ...props }) => (
        <React.Fragment>
          <RadioWidget
            {...props}
            text={get(uiSchema, ['ui:options', 'trueText'], 'Yes')}
            checked={value === true}
            style={[
              !uiSchema['ui:inline'] || uiSchema['ui:title'] !== false ? styles.padding : null,
              style,
            ]}
            value
          />
          <RadioWidget
            {...props}
            text={get(uiSchema, ['ui:options', 'falseText'], 'No')}
            checked={value === false}
            style={[
              styles.padding,
              style,
            ]}
            value={false}
          />
        </React.Fragment>
      );
    }
    return Widget;
  }
}

export default BooleanField;
