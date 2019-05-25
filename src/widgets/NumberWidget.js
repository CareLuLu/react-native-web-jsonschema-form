import React from 'react';
import PropTypes from 'prop-types';
import { repeat, isNumber } from 'lodash';
import { withHandlers, compose } from 'recompact';
import TextInputWidget from './TextInputWidget';

/* eslint no-param-reassign: 0 */
const INITIAL_ZEROS = /^0*/g;
const NUMBER_ONLY = /[^0-9]/g;
const THOUSANDS = /\B(?=(\d{3})+(?!\d))/g;

function setSymbol(value, settings) {
  let operator = '';
  if (value.indexOf('-') > -1) {
    value = value.replace('-', '');
    operator = '-';
  }
  if (value.indexOf(settings.prefix) > -1) {
    value = value.replace(settings.prefix, '');
  }
  if (value.indexOf(settings.suffix) > -1) {
    value = value.replace(settings.suffix, '');
  }
  return operator + settings.prefix + value + settings.suffix;
}

function buildIntegerPart(integerPart, negative, settings) {
  // remove initial zeros
  integerPart = integerPart.replace(INITIAL_ZEROS, '');

  // put settings.thousands every 3 chars
  integerPart = integerPart.replace(THOUSANDS, settings.thousands);
  if (integerPart === '') {
    integerPart = '0';
  }
  return negative + integerPart;
}

function maskValueStandard(value, settings) {
  const negative = (value.indexOf('-') > -1 && settings.allowNegative) ? '-' : '';
  let onlyNumbers = value.replace(NUMBER_ONLY, '');
  let integerPart = onlyNumbers.slice(0, onlyNumbers.length - settings.precision);
  let newValue;
  let decimalPart;
  let leadingZeros;

  newValue = buildIntegerPart(integerPart, negative, settings);

  if (settings.precision > 0) {
    if (!Number.isNaN(value) && value.indexOf('.')) {
      const precision = value.substr(value.indexOf('.') + 1);
      onlyNumbers += new Array(Math.max(0, (settings.precision + 1) - precision.length)).join(0);
      integerPart = onlyNumbers.slice(0, onlyNumbers.length - settings.precision);
      newValue = buildIntegerPart(integerPart, negative, settings);
    }
    decimalPart = onlyNumbers.slice(onlyNumbers.length - settings.precision);
    leadingZeros = new Array((settings.precision + 1) - decimalPart.length).join(0);
    newValue += settings.decimal + leadingZeros + decimalPart;
  }
  return setSymbol(newValue, settings);
}

function maskValueReverse(value, settings) {
  const negative = (value.indexOf('-') > -1 && settings.allowNegative) ? '-' : '';
  const valueWithoutSymbol = value.replace(settings.prefix, '').replace(settings.suffix, '');
  let integerPart = valueWithoutSymbol.split(settings.decimal)[0];
  let newValue;
  let decimalPart = '';

  if (integerPart === '') {
    integerPart = '0';
  }
  newValue = buildIntegerPart(integerPart, negative, settings);

  if (settings.precision > 0) {
    const arr = valueWithoutSymbol.split(settings.decimal);
    if (arr.length > 1) {
      [, decimalPart] = arr;
    }
    newValue += settings.decimal + decimalPart;
    const rounded = Number.parseFloat((`${integerPart}.${decimalPart}`)).toFixed(settings.precision);
    const roundedDecimalPart = rounded.toString().split(settings.decimal)[1];
    newValue = `${newValue.split(settings.decimal)[0]}.${roundedDecimalPart}`;
  }
  return setSymbol(newValue, settings);
}

function maskValue(text, settings) {
  if (settings.allowEmpty && text === '') {
    return '';
  }
  let value = text.replace(new RegExp(settings.thousands, 'g'), '');
  if (settings.precision > 0 && value.indexOf(settings.decimal) >= 0) {
    value = value.split(settings.decimal);
    if (value[1].length < settings.precision) {
      if (parseFloat(value[0]) + parseFloat(value[1]) === 0) {
        return '';
      }
      value = `${value[0].substring(0, value[0].length - 1)}${settings.decimal}${value[0][value[0].length - 1]}${value[1]}`;
    } else {
      value = `${value[0]}${settings.decimal}${value[1]}`;
    }
  } else if (settings.precision > 0) {
    if (settings.reverse) {
      value = `${text}${settings.decimal}0`;
    } else {
      value = `0${settings.decimal}${Array(settings.precision).join(0)}${text}`;
    }
  }
  if (settings.reverse) {
    return maskValueReverse(value, settings);
  }
  return maskValueStandard(value, settings);
}

const maskHandler = ({ currency, ...settings }) => (value, direction) => {
  if (!currency) {
    return value;
  }
  let textValue = value;
  if (direction === 'in') {
    const { decimal, precision } = settings;
    if (precision > 0) {
      const parts = textValue.split(decimal);
      if (parts.length < 2) {
        parts.push('0');
      }
      if (parts[1].length < precision) {
        parts[1] += repeat('0', precision - parts[1].length);
        textValue = parts.join(decimal);
      }
    }
  }
  return maskValue(textValue, settings);
};

const textParserHandler = ({ currency, thousands, decimal }) => (value) => {
  if (!currency) {
    if (value[value.length - 1] === decimal && value.split(decimal).length === 1) {
      return value;
    }
    const result = parseFloat(value);
    return isNumber(result) ? result : null;
  }
  const thousandsRegex = new RegExp(`\\${thousands}`, 'g');
  const decimalRegex = new RegExp(`\\${decimal}`);
  return parseFloat(value.replace(thousandsRegex, '').replace(decimalRegex, '.')) || null;
};

const onChangeHandler = ({ currency, onChange }) => (value, ...args) => {
  // We ignore the onChange event if not in currency mode and
  // the value is not null or number. This allows the user
  // to input "2." not triggering onChange and then "2.5"
  // triggering the change.
  if (currency || value === null || isNumber(value)) {
    onChange(value, ...args);
  }
};

const NumberWidget = compose(
  withHandlers({
    mask: maskHandler,
    textParser: textParserHandler,
    onChange: onChangeHandler,
  }),
)(props => (
  <TextInputWidget {...props} keyboardType="number-pad" />
));

NumberWidget.propTypes = {
  currency: PropTypes.bool,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  affixesStay: PropTypes.bool,
  thousands: PropTypes.string,
  decimal: PropTypes.string,
  precision: PropTypes.number,
  allowNegative: PropTypes.bool,
  allowEmpty: PropTypes.bool,
  reverse: PropTypes.bool,
};

NumberWidget.defaultProps = {
  currency: false,
  prefix: '',
  suffix: '',
  affixesStay: true,
  thousands: ',',
  decimal: '.',
  precision: 2,
  allowNegative: false,
  allowEmpty: false,
  reverse: false,
};

export default NumberWidget;
