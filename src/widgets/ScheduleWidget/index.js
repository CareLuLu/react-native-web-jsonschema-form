import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { get, times, cloneDeep } from 'lodash';
import Screen from 'react-native-web-ui-components/Screen';
import Row from 'react-native-web-ui-components/Row';
import { days } from '../../utils';
import fillSchedule from './fillSchedule';
import ArrayWidget from '../ArrayWidget';
import CheckAll from './CheckAll';

const styles = StyleSheet.create({
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
  titlePadding: {
    paddingTop: 10,
  },
});

const alwaysTrue = () => true;

const getProps = (props) => {
  const { schema, value, uiSchema } = props;

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
    'ui:options': {
      addable: false,
      removable: false,
    },
    ...uiSchema,
    'ui:title': false,
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
        'ui:widgetProps': times(100, i => ({
          ...get(uiSchema, ['items', timesAttribute, 'ui:widgetProps'], {}),
          encoder: 'string',
          header: i === 0,
          disabled: checkbox && !adjustedValue[i][dateAttribute],
          filterTime: time => filterTime(time, get(value, i, {})),
        })),
        'ui:containerProps': {
          style: styles.timesContainer,
        },
      },
    },
  };
  const container = get(uiSchema, ['items', dateAttribute, 'ui:containerProps'], {});
  propertyUiSchema.items[dateAttribute]['ui:containerProps'] = {
    ...container,
  };
  propertyUiSchema.items[dateAttribute]['ui:containerProps'].style = [
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
    ...props,
    checkbox,
    dateAttribute,
    timesAttribute,
    propertyUiSchema,
    propertySchema,
    value: adjustedValue,
  };
};

const useCheckboxParser = ({ dateAttribute, timesAttribute }) => value => value.map((v, i) => ({
  on: v[dateAttribute],
  day: days[i],
  times: v[timesAttribute],
})).filter(v => v.on).map(v => ({
  [dateAttribute]: v.day,
  [timesAttribute]: v.times,
}));

const useDateParser = () => value => value;

const useOnChange = ({
  name,
  value,
  onChange,
  scheduleParser,
  dateAttribute,
  timesAttribute,
}) => (propertyValue, propertyName, params = {}) => {
  if (propertyName !== name) {
    const nextValue = cloneDeep(value.current);
    const path = propertyName.split('.');
    const [key] = path.splice(-1, 1);
    const index = parseInt(path.splice(-1, 1)[0], 10);
    while (nextValue.length <= index) {
      nextValue.push({ [dateAttribute]: null, [timesAttribute]: '' });
    }
    nextValue[index][key] = propertyValue; // eslint-disable-line
    onChange(scheduleParser(nextValue), name, {
      ...params,
      update: [
        `${name}.${index}.${dateAttribute}`,
        `${name}.${index}.${timesAttribute}`,
      ],
    });
  } else {
    const update = [];
    const length = Math.max(propertyValue.length, value.current.length);
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

const ScheduleWidget = (props) => {
  const params = getProps(props);

  const value = useRef();
  value.current = params.value;

  const dateParser = useDateParser(params);
  const checkboxParser = useCheckboxParser(params);

  const { checkbox, propertySchema, propertyUiSchema } = params;
  const scheduleParser = checkbox ? checkboxParser : dateParser;

  const onChange = useOnChange({ ...params, value, scheduleParser });

  const hasTitle = params.uiSchema['ui:title'] !== false;

  return (
    <Row style={hasTitle ? styles.titlePadding : null}>
      <CheckAll
        {...params}
        onChange={onChange}
        scheduleParser={scheduleParser}
        propertyUiSchema={propertyUiSchema}
      />
      <ArrayWidget
        {...params}
        onChange={onChange}
        schema={propertySchema}
        uiSchema={propertyUiSchema}
      />
    </Row>
  );
};

export default ScheduleWidget;
