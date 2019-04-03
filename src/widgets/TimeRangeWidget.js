import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { withHandlers } from 'recompact';
import { pick } from 'lodash';
import { View, TimeRangePicker, StylePropType } from 'react-native-web-ui-components';
import {
  NUMBER_DECODER,
  NUMBER_ENCODER,
  STRING_DECODER,
  STRING_ENCODER,
} from 'react-native-web-ui-components/TimeRangePicker';

const styles = StyleSheet.create({
  empty: {},
  defaults: {
    marginBottom: 10,
  },
  fullWidth: {
    width: '100%',
  },
  auto: {
    marginBottom: 0,
  },
  marginTop: {
    marginTop: -10,
  },
});

const timePickerAttributes = [
  'minTime',
  'maxTime',
  'interval',
];

const TimeRangeWidget = withHandlers({
  onWrappedFocus: ({ onFocus }) => () => onFocus(),
  onWrappedChange: ({ onChange, onFocus }) => (value) => {
    onFocus();
    onChange(value);
  },
})(({
  schema,
  uiSchema,
  hasError,
  name,
  focus,
  value,
  readonly,
  disabled,
  auto,
  onWrappedChange,
  onWrappedFocus,
  encoder,
  decoder,
  header,
  style,
  ...props
}) => {
  const currentStyle = [
    styles.defaults,
    auto ? styles.auto : styles.fullWidth,
  ];
  if (header) {
    currentStyle.push(styles.marginTop);
  }
  currentStyle.push(style);

  const timePickerProps = pick(props, timePickerAttributes);
  timePickerProps.header = header;
  if (encoder !== null) {
    if (encoder === 'number') {
      timePickerProps.encoder = NUMBER_ENCODER;
      timePickerProps.decoder = NUMBER_DECODER;
    } else if (encoder === 'string') {
      timePickerProps.encoder = STRING_ENCODER;
      timePickerProps.decoder = STRING_DECODER;
    } else {
      timePickerProps.encoder = encoder;
      timePickerProps.decoder = decoder;
    }
  }
  return (
    <View style={currentStyle}>
      <TimeRangePicker
        {...timePickerProps}
        name={name}
        hasError={hasError}
        disabled={disabled}
        readonly={readonly}
        value={value}
        onFocus={onWrappedFocus}
        onChange={onWrappedChange}
      />
    </View>
  );
});

TimeRangeWidget.propTypes = {
  schema: PropTypes.shape({}).isRequired,
  uiSchema: PropTypes.shape({}).isRequired,
  hasError: PropTypes.bool.isRequired,
  onFocus: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  focus: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  auto: PropTypes.bool,
  style: StylePropType,
  encoder: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  decoder: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  header: PropTypes.bool,
};

TimeRangeWidget.defaultProps = {
  focus: null,
  value: null,
  readonly: false,
  disabled: false,
  auto: false,
  style: null,
  text: undefined,
  checked: false,
  encoder: null,
  decoder: null,
  header: true,
};

export default TimeRangeWidget;
