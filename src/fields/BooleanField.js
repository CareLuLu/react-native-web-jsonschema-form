import React from 'react';
import { StyleSheet } from 'react-native';
import { get } from 'lodash';
import AbstractField from './AbstractField';
import { getComponent } from '../utils';

const styles = StyleSheet.create({
  padding: {
    paddingLeft: 10,
  },
  margin: {
    marginBottom: 10,
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
      Widget = ({ value, ...props }) => ( // eslint-disable-line
        <CheckboxWidget {...props} value={trueValue} checked={value === trueValue} />
      );
    } else if (widgetName === 'radio' || widgetName === 'radiobox') {
      const { RadioWidget } = widgets;
      const inlineOptions = uiSchema['ui:options'] && uiSchema['ui:options'].inline;
      Widget = ({ value, style, ...props }) => ( // eslint-disable-line
        <React.Fragment>
          <RadioWidget
            {...props}
            auto={uiSchema['ui:inline'] || inlineOptions}
            text={trueText}
            checked={value === trueValue}
            style={[
              uiSchema['ui:inline'] && uiSchema['ui:title'] !== false ? styles.padding : null,
              !uiSchema['ui:inline'] ? styles.margin : null,
              style,
            ]}
            value={trueValue}
          />
          <RadioWidget
            {...props}
            auto={uiSchema['ui:inline'] || inlineOptions}
            text={falseText}
            checked={value === falseValue}
            style={[
              uiSchema['ui:inline'] || inlineOptions ? styles.padding : null,
              !uiSchema['ui:inline'] ? styles.margin : null,
              style,
            ]}
            value={falseValue}
          />
        </React.Fragment>
      );
    } else {
      Widget = getComponent(widgetName, 'Widget', widgets);
      if (!Widget) {
        Widget = this.getDefaultWidget() || (() => null);
      }
    }

    const ParsedWidget = (props) => {
      const { onChange } = props;
      const wrappedOnChange = (value, ...args) => {
        if (value !== trueValue) {
          return onChange(falseValue, ...args);
        }
        return onChange(trueValue, ...args);
      };

      return <Widget {...props} onChange={wrappedOnChange} />;
    };
    return ParsedWidget;
  }
}

export default BooleanField;
