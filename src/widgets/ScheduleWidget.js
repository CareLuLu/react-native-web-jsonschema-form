import React from 'react';
import { StyleSheet } from 'react-native';
import {
  withProps,
  withHandlers,
  compose,
} from 'recompact';
import {
  get,
  set,
  find,
  times,
} from 'lodash';
import { Screen, Column } from 'react-native-web-ui-components';
import ArrayWidget from './ArrayWidget';
import CheckboxWidget from './CheckboxWidget';

/* eslint no-param-reassign: 0 */

const styles = StyleSheet.create({
  checkAll: {
    paddingTop: Screen.getType() === 'xs' ? 0 : 10,
  },
});

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const fillSchedule = (value, timesAttribute, dateAttribute) => {
  const schedule = [];
  days.forEach((day) => {
    let entry = find(value, { [dateAttribute]: day });
    if (!entry) {
      entry = { [dateAttribute]: false, [timesAttribute]: '' };
    } else {
      entry = {
        [dateAttribute]: !!entry[dateAttribute],
        [timesAttribute]: entry[timesAttribute],
      };
    }
    schedule.push(entry);
  });
  return schedule;
};

const setValueHandler = ({
  name,
  arrayParser,
  formattedValues,
}) => value => set(formattedValues, `${name}`.replace(/\.[0-9]+\./g, '[$1]'), arrayParser(value));

const checkboxParserHandler = ({ dateAttribute, timesAttribute }) => value => value.map((v, i) => ({
  on: v[dateAttribute],
  day: days[i],
  times: v[timesAttribute],
})).filter(v => (v.on && v.times.length)).map(v => ({
  [dateAttribute]: v.day,
  [timesAttribute]: v.times,
}));

const dateParserHandler = ({ dateAttribute, timesAttribute }) => value => value
  .filter(v => (v[dateAttribute] && v[timesAttribute].length));

const onChangeHandler = ({
  field,
  onChange,
  arrayValues,
}) => (value, ...args) => {
  const path = args[0].split('.');
  const [key] = path.splice(-1, 1);
  const index = parseInt(path.splice(-1, 1)[0], 10);

  arrayValues[index][key] = value;
  field.cache = null;
  field.arrayValues = arrayValues;
  onChange(value, ...args);
};

const checkAllOnFocusHandler = ({ onFocus }) => () => onFocus('');

const checkAllOnChangeHandler = ({
  name,
  field,
  options,
  setValue,
  dateAttribute,
  timesAttribute,
  propertyUiSchema,
  formattedValues,
}) => (checked) => {
  const { checkAll } = propertyUiSchema['ui:options'];
  if (checkAll) {
    let checkAllValue;
    if (checked) {
      checkAllValue = fillSchedule(checkAll.value || [], timesAttribute, dateAttribute);
    } else {
      checkAllValue = fillSchedule([], timesAttribute, dateAttribute);
    }
    field.cache = null;
    field.arrayValues = checkAllValue;
    setValue(checkAllValue);
    options.onChangeFormatted(formattedValues, name);
  }
};

const CheckAll = compose(
  withHandlers({
    onFocus: checkAllOnFocusHandler,
    onChange: checkAllOnChangeHandler,
  }),
)(({
  name,
  onFocus,
  onChange,
  arrayValues,
  dateAttribute,
  timesAttribute,
  propertyUiSchema,
}) => {
  const { checkAll } = propertyUiSchema['ui:options'];
  if (!checkAll) {
    return null;
  }
  const length = (checkAll.value && checkAll.value.length) || 0;
  const checkAllValue = fillSchedule(checkAll.value || [], timesAttribute, dateAttribute);
  let checked = true;
  if (checkAllValue.length > arrayValues.length) {
    checked = false;
  } else {
    for (let i = 0; checked && i < length; i += 1) {
      if (
        checkAllValue[i][dateAttribute] !== arrayValues[i][dateAttribute]
        || (arrayValues[i][timesAttribute] || '').indexOf(checkAllValue[i][timesAttribute]) < 0
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
        schema={schema}
        uiSchema={uiSchema}
        hasError={false}
        onFocus={onFocus}
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
});

const getProps = ({
  name,
  schema,
  field,
  uiSchema,
  formattedValues,
}) => {
  const attributes = Object.keys(schema.items.properties);
  if (attributes.length > 2) {
    throw new Error('Schedule widget is supposed to run on an array with day/date and time');
  }
  const index = schema.items.properties[attributes[0]].type === 'array' ? 0 : 1;
  const timesAttribute = attributes[index];
  const dateAttribute = attributes[index ? 0 : 1];

  const dateWidget = get(uiSchema, ['items', dateAttribute, 'ui:widget'], 'checkbox');
  const checkbox = dateWidget === 'checkbox';

  let propertySchema = schema;
  let arrayValues = field.arrayValues || get(formattedValues, `${name}`.replace(/\.[0-9]+\./g, '[$1]'));
  if (checkbox) {
    arrayValues = field.arrayValues || fillSchedule(
      arrayValues,
      timesAttribute,
      dateAttribute,
    );
    propertySchema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          [dateAttribute]: { type: 'boolean' },
          [timesAttribute]: { type: 'string' },
        },
      },
    };
  }
  field.arrayValues = arrayValues;

  const propertyUiSchema = {
    'ui:title': false,
    'ui:options': {
      addable: false,
      removable: false,
    },
    ...uiSchema,
    items: {
      'ui:title': false,
      'ui:grid': [
        {
          type: 'grid',
          columns: [
            { xs: 12, sm: 3, md: 2 },
            { xs: 12, sm: 9, md: 10 },
          ],
          children: [
            dateAttribute,
            timesAttribute,
          ],
        },
      ],
      [dateAttribute]: {
        'ui:title': false,
        'ui:widget': dateWidget,
        'ui:widgetProps': dateWidget === 'checkbox'
          ? days.map(text => ({ text, adjustTitle: false }))
          : get(uiSchema, ['items', dateAttribute, 'ui:widgetProps'], {}),
      },
      [timesAttribute]: {
        'ui:title': false,
        'ui:widget': 'timeRange',
        'ui:widgetProps': times(7, i => ({
          encoder: 'string',
          header: i === 0,
          disabled: checkbox && !arrayValues[i][dateAttribute],
        })),
      },
    },
  };
  const options = { ...(propertyUiSchema['ui:options'] || {}) };
  options.orderable = false;
  if (checkbox) {
    options.addable = false;
    options.removable = false;
  }
  propertyUiSchema['ui:options'] = options;
  return {
    checkbox,
    arrayValues,
    dateAttribute,
    timesAttribute,
    propertyUiSchema,
    propertySchema,
  };
};

const ScheduleWidget = compose(
  withProps(getProps),
  withHandlers({
    dateParser: dateParserHandler,
    checkboxParser: checkboxParserHandler,
    onChange: onChangeHandler,
  }),
  withProps(({ checkbox, dateParser, checkboxParser }) => ({
    arrayParser: checkbox ? checkboxParser : dateParser,
  })),
  withHandlers({
    setValue: setValueHandler,
  }),
)(({
  options,
  onChange,
  checkbox,
  dateParser,
  arrayValues,
  checkboxParser,
  propertySchema,
  propertyUiSchema,
  ...props
}) => {
  const { setValue } = props;
  setValue(arrayValues);
  return (
    <React.Fragment>
      <CheckAll
        {...props}
        options={options}
        arrayValues={arrayValues}
        propertyUiSchema={propertyUiSchema}
      />
      <ArrayWidget
        {...props}
        arrayValues={arrayValues}
        schema={propertySchema}
        uiSchema={propertyUiSchema}
        options={{ ...options, onChange }}
      />
    </React.Fragment>
  );
});

ScheduleWidget.custom = true;

export default ScheduleWidget;
