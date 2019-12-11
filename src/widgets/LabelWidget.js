import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { pick, omit } from 'lodash';
import { useTheme } from 'react-native-web-ui-components/Theme';
import View from 'react-native-web-ui-components/View';
import Text from 'react-native-web-ui-components/Text';
import Checkbox from 'react-native-web-ui-components/Checkbox';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import { viewStyleKeys } from '../utils';

const styles = StyleSheet.create({
  error: {
    color: '#EE2D68',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
  },
  labelContainer: {
    paddingTop: 10,
    paddingBottom: 5,
  },
  labelText: {
    fontWeight: 'bold',
  },
  checkbox: {
    height: 20,
    marginRight: 5,
  },
  checkboxIcon: {
    fontSize: 20,
    height: 20,
    lineHeight: 20,
  },
  fullWidth: {
    width: '100%',
  },
});

const useOnPress = ({
  name,
  meta,
  value,
  onChange,
}) => checked => onChange(value, name, {
  nextMeta: { ...meta, 'ui:disabled': !!checked },
});

const LabelWidget = (preProps) => {
  const props = useTheme('LabelWidget', preProps);

  const {
    onPress,
    children,
    theme,
    themeTextStyle,
    style,
    hasError,
    label,
    meta,
    auto,
    hasTitle,
    toggleable,
    className,
  } = props;

  const onCheckboxPress = useOnPress(props);

  const currentContainerStyle = [
    styles.container,
    auto ? null : styles.fullWidth,
  ];
  const currentTextStyle = [];
  if (label) {
    currentContainerStyle.push(styles.labelContainer);
    currentTextStyle.push(styles.labelText);
  }
  if (hasError) {
    currentTextStyle.push({ color: StyleSheet.flatten(theme.input.error.border).borderColor });
  } else {
    currentTextStyle.push(themeTextStyle.text);
  }
  const css = StyleSheet.flatten(style || {});

  return (
    <View className={className} style={[currentContainerStyle, pick(css, viewStyleKeys)]}>
      {toggleable ? (
        <Checkbox
          text={null}
          checked={!(meta && meta['ui:disabled'])}
          value
          auto
          style={styles.checkbox}
          styleChecked={styles.checkboxIcon}
          styleUnchecked={styles.checkboxIcon}
          onPress={onCheckboxPress}
        />
      ) : null}
      {hasTitle ? (
        <Text auto onPress={onPress} style={[currentTextStyle, omit(css, viewStyleKeys)]}>
          {children}
        </Text>
      ) : null}
    </View>
  );
};

LabelWidget.propTypes = {
  theme: PropTypes.shape().isRequired,
  themeTextStyle: PropTypes.shape().isRequired,
  hasError: PropTypes.bool.isRequired,
  hasTitle: PropTypes.bool.isRequired,
  toggleable: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  style: StylePropType,
  label: PropTypes.bool,
  auto: PropTypes.bool,
  meta: PropTypes.any, // eslint-disable-line
  onPress: PropTypes.func,
  className: PropTypes.string,
};

LabelWidget.defaultProps = {
  style: null,
  label: false,
  auto: false,
  children: null,
  onPress: undefined,
  className: '',
};

export default LabelWidget;
