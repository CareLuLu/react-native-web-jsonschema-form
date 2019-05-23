import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { withHandlers } from 'recompact';
import Screen from 'react-native-web-ui-components/Screen';
import Checkbox from 'react-native-web-ui-components/Checkbox';
import StylePropType from 'react-native-web-ui-components/StylePropType';

const styles = StyleSheet.create({
  defaults: {
    height: 40,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 2,
    marginBottom: 10,
  },
  fullWidth: {
    width: '100%',
  },
  auto: {
    marginBottom: 0,
  },
  alone: {
    height: 23,
  },
  adjustTitle: {
    marginTop: 20,
  },
});

const CheckboxWidget = withHandlers({
  onWrappedFocus: ({ name, onFocus }) => () => onFocus(name),
  onWrappedChange: ({ name, uncheckable, onChange }) => (checked, value) => {
    if (!checked || uncheckable) {
      onChange(!checked ? value : undefined, name);
    }
  },
})(({
  uiSchema,
  name,
  focus,
  value,
  readonly,
  disabled,
  hasError,
  auto,
  onWrappedChange,
  onWrappedFocus,
  text,
  checked,
  gridItemType,
  gridItemLength,
  adjustTitle,
  style,
  styleChecked,
  styleUnchecked,
  styleCheckedText,
  styleUncheckedText,
  Wrapper,
}) => {
  const focused = focus === name || (focus === null && uiSchema['ui:autofocus']);
  const css = [styles.defaults];
  if (gridItemType !== 'grid' || gridItemLength <= 1 || Screen.getType() === 'xs') {
    css.push(styles.alone);
  }
  if (
    adjustTitle
    && gridItemType === 'grid'
    && gridItemLength > 1
    && Screen.getType() !== 'xs'
    && uiSchema['ui:title'] === false
    && !uiSchema['ui:toggleable']
  ) {
    css.push(styles.adjustTitle);
  }
  css.push(auto ? styles.auto : styles.fullWidth);
  css.push(style);
  return (
    <React.Fragment>
      <Wrapper
        disabled={disabled}
        readonly={readonly}
        hasError={hasError}
        text={text}
        checked={checked}
        value={value}
        auto={auto}
        onPress={onWrappedChange}
        onFocus={onWrappedFocus}
        autoFocus={focused}
        style={css}
        styleChecked={styleChecked}
        styleUnchecked={styleUnchecked}
        styleCheckedText={styleCheckedText}
        styleUncheckedText={styleUncheckedText}
      />
    </React.Fragment>
  );
});

CheckboxWidget.propTypes = {
  uiSchema: PropTypes.shape().isRequired,
  onFocus: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  gridItemType: PropTypes.string.isRequired,
  gridItemLength: PropTypes.number.isRequired,
  focus: PropTypes.string,
  value: PropTypes.any, // eslint-disable-line
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  hasError: PropTypes.bool,
  auto: PropTypes.bool,
  style: StylePropType,
  styleChecked: StylePropType,
  styleUnchecked: StylePropType,
  styleCheckedText: StylePropType,
  styleUncheckedText: StylePropType,
  text: PropTypes.string,
  checked: PropTypes.bool,
  adjustTitle: PropTypes.bool,
  uncheckable: PropTypes.bool,
};

CheckboxWidget.defaultProps = {
  focus: null,
  value: true,
  readonly: false,
  disabled: false,
  hasError: false,
  auto: false,
  style: null,
  styleChecked: null,
  styleUnchecked: null,
  styleCheckedText: null,
  styleUncheckedText: null,
  text: undefined,
  checked: false,
  adjustTitle: true,
  Wrapper: Checkbox,
  uncheckable: true,
};

export default CheckboxWidget;
