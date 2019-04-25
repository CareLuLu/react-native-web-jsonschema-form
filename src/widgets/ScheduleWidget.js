import React from 'react';
import { StyleSheet } from 'react-native';
import {
  withProps,
  withHandlers,
  compose,
} from 'recompact';
import {
  get,
  find,
  times,
} from 'lodash';
import Screen from 'react-native-web-ui-components/Screen';
import Column from 'react-native-web-ui-components/Column';
import ArrayWidget from './ArrayWidget';
import CheckboxWidget from './CheckboxWidget';

/* eslint no-param-reassign: 0 */

const styles = StyleSheet.create({
  checkAll: {
    paddingTop: Screen.getType() === 'xs' ? 0 : 10,
  },
  dateContainer: {
    minWidth: 130,
    maxWidth: 130,
    width: 130,
    marginRight: 10,
  },
  timesContainer: {
    minWidth: 250,
    flex: 1,
  },
  checkbox: {
    height: 40,
    marginBottom: 10,
  },
  checkboxXs: {
    height: 23,
    marginBottom: 5,
  },
});

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const alwaysTrue = () => true;

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

const checkboxParserHandler = ({ dateAttribute, timesAttribute }) => value => value.map((v, i) => ({
  on: v[dateAttribute],
  day: days[i],
  times: v[timesAttribute],
})).filter(v => v.on).map(v => ({
  [dateAttribute]: v.day,
  [timesAttribute]: v.times,
}));

const dateParserHandler = () => value => value;

const onChangeHandler = ({
  name,
  value,
  onChange,
  scheduleParser,
  dateAttribute,
  timesAttribute,
}) => (propertyValue, propertyName, params = {}) => {
  if (propertyName !== name) {
    const path = propertyName.split('.');
    const [key] = path.splice(-1, 1);
    const index = parseInt(path.splice(-1, 1)[0], 10);
    while (value.length <= index) {
      value.push({ [dateAttribute]: null, [timesAttribute]: '' });
    }
    value[index][key] = propertyValue;
    onChange(scheduleParser(value), name, {
      ...params,
      update: [
        `${name}.${index}.${dateAttribute}`,
        `${name}.${index}.${timesAttribute}`,
      ],
    });
  } else {
    const update = [];
    const length = Math.max(propertyValue.length, value.length);
    for (let i = 0; i < length; i += 1) {
      update.push(`${name}.${i}.${dateAttribute}`);
      update.push(`${name}.${i}.${timesAttribute}`);
    }
    onChange(propertyValue, propertyName, {
      ...params,
      update,
    });
  }
};

const checkAllOnChangeHandler = ({
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

const CheckAll = compose(
  withHandlers({
    onChange: checkAllOnChangeHandler,
  }),
)(({
  name,
  value,
  onFocus,
  onChange,
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
  schema,
  value,
  uiSchema,
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
  let adjustedValue = value;
  if (checkbox) {
    adjustedValue = fillSchedule(
      adjustedValue,
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

  const filterTime = get(uiSchema, ['items', timesAttribute, 'ui:widgetProps', 'filterTime'], alwaysTrue);

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
          type: 'row',
          xs: 12,
          children: [
            dateAttribute,
            timesAttribute,
          ],
        },
      ],
      [dateAttribute]: {
        ...get(uiSchema, ['items', dateAttribute], {}),
        'ui:title': false,
        'ui:widget': dateWidget,
        'ui:widgetProps': dateWidget === 'checkbox'
          ? days.map((text, i) => ({
            ...get(uiSchema, ['items', dateAttribute, 'ui:widgetProps'], {}),
            text,
            adjustTitle: false,
            style: [
              Screen.getType() === 'xs' ? styles.checkboxXs : styles.checkbox,
              i === 0 ? { marginTop: Screen.getType() !== 'xs' ? 4 : 0 } : null,
              i === 0 && Screen.getType() === 'xs' ? { marginBottom: 9 } : null,
            ],
          }))
          : get(uiSchema, ['items', dateAttribute, 'ui:widgetProps'], {}),
      },
      [timesAttribute]: {
        ...get(uiSchema, ['items', timesAttribute], {}),
        'ui:title': false,
        'ui:widget': 'timeRange',
        'ui:widgetProps': times(7, i => ({
          ...get(uiSchema, ['items', timesAttribute, 'ui:widgetProps'], {}),
          encoder: 'string',
          header: i === 0,
          disabled: checkbox && !adjustedValue[i][dateAttribute],
          filterTime: time => filterTime(time, get(value, i, {})),
        })),
        'ui:container': {
          style: styles.timesContainer,
        },
      },
    },
  };
  const container = get(uiSchema, ['items', dateAttribute, 'ui:container'], {});
  propertyUiSchema.items[dateAttribute]['ui:container'] = {
    ...container,
  };
  propertyUiSchema.items[dateAttribute]['ui:container'].style = [
    styles.dateContainer,
    container.style || null,
  ];
  if (!checkbox) {
    const widgetProps = propertyUiSchema.items[dateAttribute]['ui:widgetProps'];
    propertyUiSchema.items[dateAttribute]['ui:widgetProps'] = [
      {
        ...widgetProps,
        style: [
          { marginTop: Screen.getType() !== 'xs' ? 4 : 0 },
          widgetProps.style || null,
        ],
      },
      widgetProps,
    ];
  }


  const options = { ...(propertyUiSchema['ui:options'] || {}) };
  options.orderable = false;
  if (checkbox) {
    options.addable = false;
    options.removable = false;
  }
  propertyUiSchema['ui:options'] = options;
  return {
    checkbox,
    dateAttribute,
    timesAttribute,
    propertyUiSchema,
    propertySchema,
    value: adjustedValue,
  };
};

const ScheduleWidget = compose(
  withProps(getProps),
  withHandlers({
    dateParser: dateParserHandler,
    checkboxParser: checkboxParserHandler,
  }),
  withProps(({ checkbox, dateParser, checkboxParser }) => ({
    scheduleParser: checkbox ? checkboxParser : dateParser,
  })),
  withHandlers({
    onChange: onChangeHandler,
  }),
)(({
  propertySchema,
  propertyUiSchema,
  ...props
}) => (
  <React.Fragment>
    <CheckAll
      {...props}
      propertyUiSchema={propertyUiSchema}
    />
    <ArrayWidget
      {...props}
      schema={propertySchema}
      uiSchema={propertyUiSchema}
    />
  </React.Fragment>
));

export default ScheduleWidget;
