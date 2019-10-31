import React from 'react';
import { StyleSheet } from 'react-native';
import { isArray, without } from 'lodash';
import AbstractField from './AbstractField';

const styles = StyleSheet.create({
  padding: {
    paddingLeft: 10,
  },
  margin: {
    marginBottom: 10,
  },
});

class AbstractEnumerableField extends AbstractField {
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
      const inlineOptions = uiSchema['ui:options'] && uiSchema['ui:options'].inline;
      Widget = ({ value, style, ...props }) => ( // eslint-disable-line
        <React.Fragment>
          {values.map((trueValue, i) => (
            <BaseWidget
              {...props}
              auto={uiSchema['ui:inline'] || inlineOptions}
              key={trueValue}
              text={labels[i]}
              checked={value === trueValue}
              style={[
                (
                  (uiSchema['ui:inline'] && uiSchema['ui:title'] !== false)
                  || (
                    i > 0
                    && (uiSchema['ui:inline'] || inlineOptions)
                  )
                ) ? styles.padding : null,
                !uiSchema['ui:inline'] ? styles.margin : null,
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

export default AbstractEnumerableField;
