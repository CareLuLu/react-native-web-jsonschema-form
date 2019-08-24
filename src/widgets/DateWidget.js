import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { withHandlers } from 'recompact';
import Datepicker from 'react-native-web-ui-components/Datepicker';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import createDomStyle from 'react-native-web-ui-components/createDomStyle';

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

const DateWidget = withHandlers({
  onWrappedFocus: ({ name, onFocus }) => () => onFocus(name),
  onWrappedChange: ({ name, onChange }) => value => onChange(value, name),
})(({
  uiSchema,
  onChange,
  onWrappedChange,
  onWrappedFocus,
  name,
  focus,
  value,
  placeholder,
  readonly,
  disabled,
  hasError,
  auto,
  style,
  showCalendarOnFocus,
}) => {
  const focused = focus === name || (focus === null && uiSchema['ui:autofocus']);
  const css = [styles.defaults];
  css.push(auto ? styles.auto : styles.fullWidth);
  css.push(style);
  const className = `DateWidget__${name.replace(/\./g, '-')}`;
  let date = value;
  if (date && date.indexOf('T') >= 0) {
    date = date.split('T')[0].split('-');
    date = `${date[1]}/${date[2]}/${date[0]}`;
    setTimeout(() => onChange(date, name, {
      silent: true,
    }));
  }
  return (
    <Datepicker
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
      onFocus={onWrappedFocus}
      placeholder={placeholder}
      autoFocus={focused}
      customStyles={{
        input: css,
      }}
      showCalendarOnFocus={showCalendarOnFocus}
      css={`
        .react-datepicker__input-container input.${className} {
          ${createDomStyle(css)}
        }
      `}
    />
  );
});

DateWidget.propTypes = {
  uiSchema: PropTypes.shape({}).isRequired,
  onFocus: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  focus: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  placeholder: PropTypes.string,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  hasError: PropTypes.bool,
  auto: PropTypes.bool,
  style: StylePropType,
  showCalendarOnFocus: PropTypes.bool,
};

DateWidget.defaultProps = {
  focus: null,
  value: '',
  placeholder: '',
  readonly: false,
  disabled: false,
  hasError: false,
  auto: false,
  style: null,
  showCalendarOnFocus: true,
};

export default DateWidget;
