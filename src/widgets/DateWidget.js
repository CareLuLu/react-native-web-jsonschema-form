import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { StyleSheet } from 'react-native';
import { pick } from 'lodash';
import Datepicker from 'react-native-web-ui-components/Datepicker';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import createDomStyle from 'react-native-web-ui-components/createDomStyle';
import {
  useOnChange,
  useAutoFocus,
} from '../utils';

const styles = StyleSheet.create({
  defaults: {
    marginBottom: 10,
  },
  fullWidth: {
    width: '100%',
  },
  auto: {
    marginBottom: 0,
  },
});

const datepickerProps = [
  'mode',
  'format',
  'timeIntervals',
  'is24Hour',
];

const DateWidget = (props) => {
  const {
    uiSchema,
    onChange,
    name,
    value,
    placeholder,
    readonly,
    disabled,
    hasError,
    auto,
    style,
    showCalendarOnFocus,
    mode,
    format,
  } = props;

  const autoFocusParams = useAutoFocus(props);
  const onWrappedChange = useOnChange(props);

  let currentFormat = format;
  if (!currentFormat) {
    switch (mode) {
      case 'time': currentFormat = 'h:mma'; break;
      case 'datetime': currentFormat = 'MM/DD/YYYY h:mma'; break;
      default: currentFormat = 'MM/DD/YYYY';
    }
  }

  const css = [styles.defaults];
  css.push(auto ? styles.auto : styles.fullWidth);
  css.push(style);
  const className = `DateWidget__${name.replace(/\./g, '-')}`;

  let date = value;
  if (date && date.indexOf('T') >= 0) {
    date = moment(date).parseZone().format(currentFormat);
    setTimeout(() => onChange(date, name, {
      silent: true,
    }));
  }

  return (
    <Datepicker
      {...pick(props, datepickerProps)}
      {...autoFocusParams}
      disabled={disabled}
      readonly={readonly}
      hasError={hasError}
      name={name}
      className={className}
      excludeDates={uiSchema['ui:excludeDates'] || null}
      minDate={uiSchema['ui:minDate'] || null}
      maxDate={uiSchema['ui:maxDate'] || null}
      auto={auto}
      date={date}
      onDateChange={onWrappedChange}
      placeholder={placeholder}
      customStyles={{
        input: css,
      }}
      showCalendarOnFocus={showCalendarOnFocus}
      css={`
        .react-datepicker__input-container input.${className} {
          ${createDomStyle(css)}
        }
      `}
      mode={mode}
      format={currentFormat}
    />
  );
};

DateWidget.propTypes = {
  uiSchema: PropTypes.shape().isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  placeholder: PropTypes.string,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  hasError: PropTypes.bool,
  auto: PropTypes.bool,
  style: StylePropType,
  showCalendarOnFocus: PropTypes.bool,
  mode: PropTypes.oneOf(['date', 'datetime', 'time']),
  format: PropTypes.string,
};

DateWidget.defaultProps = {
  value: '',
  placeholder: '',
  readonly: false,
  disabled: false,
  hasError: false,
  auto: false,
  style: null,
  showCalendarOnFocus: true,
  mode: 'date',
  format: null,
};

export default DateWidget;
