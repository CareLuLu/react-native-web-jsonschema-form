import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import Screen from 'react-native-web-ui-components/Screen';
import Column from 'react-native-web-ui-components/Column';
import fillSchedule from './fillSchedule';
import { useAutoFocus } from '../../utils';
import CheckboxWidget from '../CheckboxWidget';

const styles = StyleSheet.create({
  checkAll: {
    paddingTop: Screen.getType() === 'xs' ? 0 : 10,
  },
});

const useOnChange = ({
  name,
  onChange,
  dateAttribute,
  timesAttribute,
  propertyUiSchema,
  scheduleParser,
}) => (checked) => {
  const { checkAll } = propertyUiSchema['ui:options'];
  if (checkAll) {
    let checkAllValue;
    if (checked) {
      checkAllValue = fillSchedule(checkAll.value || [], timesAttribute, dateAttribute);
    } else {
      checkAllValue = fillSchedule([], timesAttribute, dateAttribute);
    }
    onChange(scheduleParser(checkAllValue), name);
  }
};

const CheckAll = (props) => {
  const {
    name,
    value,
    dateAttribute,
    timesAttribute,
    propertyUiSchema,
  } = props;

  const onChange = useOnChange(props);
  const autoFocusParams = useAutoFocus(props);

  const { checkAll } = propertyUiSchema['ui:options'];
  if (!checkAll) {
    return null;
  }
  const length = (checkAll.value && checkAll.value.length) || 0;
  const checkAllValue = fillSchedule(checkAll.value || [], timesAttribute, dateAttribute);
  let checked = true;
  if (checkAllValue.length > value.length) {
    checked = false;
  } else {
    for (let i = 0; checked && i < length; i += 1) {
      if (
        checkAllValue[i][dateAttribute] !== value[i][dateAttribute]
        || (value[i][timesAttribute] || '').indexOf(checkAllValue[i][timesAttribute]) < 0
      ) {
        checked = false;
      }
    }
  }

  const schema = { type: 'boolean' };
  const uiSchema = {};

  return (
    <Column xs={12}>
      <CheckboxWidget
        {...autoFocusParams}
        schema={schema}
        uiSchema={uiSchema}
        hasError={false}
        onChange={onChange}
        name={`${name}__checkAll`}
        gridItemType="column"
        gridItemLength={1}
        value
        text={checkAll.label}
        checked={checked}
        style={styles.checkAll}
      />
    </Column>
  );
};

CheckAll.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.arrayOf(PropTypes.any).isRequired,
  dateAttribute: PropTypes.string.isRequired,
  timesAttribute: PropTypes.string.isRequired,
  propertyUiSchema: PropTypes.shape().isRequired,
};

export default CheckAll;
