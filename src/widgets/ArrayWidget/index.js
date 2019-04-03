import React from 'react';
import { StyleSheet } from 'react-native';
import {
  get,
  set,
  each,
  last,
  times,
  isArray,
} from 'lodash';
import {
  withState,
  withProps,
  withHandlers,
  compose,
} from 'recompact';
import { Screen, Button } from 'react-native-web-ui-components';
import { ucfirst, titleize } from '../../../utils/string';
import OrderHandle from './OrderHandle';
import RemoveHandle from './RemoveHandle';
import DraggableItem from './DraggableItem';

/* eslint react/no-array-index-key: 0 */

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    paddingTop: 10,
  },
  labelXs: {
    paddingBottom: 5,
  },
});

const formatTitle = title => titleize(title).replace(/ies$/, 'y').replace(/s$/, '');

const getField = type => `${ucfirst(type)}Field`;

const iterateUiSchema = (uiSchema, i) => {
  const widgetProps = uiSchema['ui:widgetProps'] || {};
  const titleProps = uiSchema['ui:titleProps'] || {};
  const errorProps = uiSchema['ui:errorProps'] || {};
  return {
    ...uiSchema,
    'ui:widgetProps': isArray(widgetProps) ? (widgetProps[i] || {}) : widgetProps,
    'ui:titleProps': isArray(titleProps) ? (titleProps[i] || {}) : titleProps,
    'ui:errorProps': isArray(errorProps) ? (errorProps[i] || {}) : errorProps,
  };
};

const adjustUiSchema = (uiSchema, i) => {
  const adjustedUiSchema = iterateUiSchema(uiSchema, i);
  each(uiSchema, (uis, key) => {
    if (!/^ui:/.test(key)) {
      adjustedUiSchema[key] = iterateUiSchema(uis, i);
    }
  });
  return adjustedUiSchema;
};

const parser = value => value;

const getProps = ({
  name,
  schema,
  fields,
  uiSchema,
  formData,
  castValue,
  formattedValues,
  formatExpression,
  arrayParser,
  arrayValues,
}) => { // eslint-disable-line
  const screenType = Screen.getType();
  const expressionOptions = {
    name,
    key: last(name.split('.')),
    value: castValue(formData[name], schema),
  };
  const title = `${formatExpression(uiSchema['ui:title'] || '%title%', expressionOptions)}`;

  const defaultUiSchema = uiSchema['*'] || {};
  const propertySchema = schema.items;
  const propertyUiSchema = Object.assign(
    {},
    defaultUiSchema,
    uiSchema.items || {},
    { '*': defaultUiSchema || uiSchema['*'] },
  );
  const { BaseField } = fields;
  const PropertyField = fields[getField(propertySchema.type)];
  const list = arrayValues || get(formattedValues, name) || [];
  const options = uiSchema['ui:options'] || {};

  const baseFieldUiSchema = Object.assign({
    'ui:titleProps': {},
  }, uiSchema);
  if (schema.items.type === 'object') {
    baseFieldUiSchema['ui:titleProps'].style = [
      styles.label,
      screenType === 'xs' ? styles.labelXs : null,
      baseFieldUiSchema['ui:titleProps'].style || null,
    ];
  }

  const extraProps = {
    list,
    title,
    screenType,
    propertySchema,
    propertyUiSchema,
    PropertyField,
    BaseField,
    baseFieldUiSchema,
    arrayParser: arrayParser || parser,
    addLabel: options.addLabel || `Add ${formatTitle(title)}`,
    addable: options.addable !== false,
    removable: options.removable !== false,
    orderable: options.orderable !== false,
    OrderComponent: options.OrderComponent || OrderHandle,
    RemoveComponent: options.RemoveComponent || RemoveHandle,
  };
  return extraProps;
};

const onAddHandler = ({
  list,
  name,
  schema,
  options,
  arrayParser,
  formattedValues,
}) => () => {
  let newItem = '';
  if (schema.items.type === 'object') {
    newItem = { __: 'new' };
  } else if (schema.items.type === 'array') {
    newItem = [];
  }
  const newList = list.concat(list.length !== 0 ? [newItem] : [newItem, newItem]);
  set(formattedValues, `${name}`.replace(/\.[0-9]+\./g, '[$1]'), arrayParser(newList));
  options.onChangeFormatted(formattedValues, name);
  options.onFocus('');
};

const onRemoveHandler = ({
  list,
  name,
  options,
  arrayParser,
  formattedValues,
}) => (index) => {
  const newList = list.filter((v, i) => (i !== index));
  set(formattedValues, `${name}`.replace(/\.[0-9]+\./g, '[$1]'), arrayParser(newList));
  options.onChangeFormatted(formattedValues, name);
};

const onChangeHandler = ({
  onChange,
}) => (value, ...args) => onChange(value, ...args);

const PropertyComponentHandler = topProps => innerProps => (
  <DraggableItem {...topProps} {...innerProps} />
);

const ArrayWidget = compose(
  withState('dragging', 'setDragging', null),
  withProps(getProps),
  withHandlers({
    onAdd: onAddHandler,
    onRemove: onRemoveHandler,
    onChange: onChangeHandler,
  }),
  withHandlers({
    PropertyComponent: PropertyComponentHandler,
  }),
)(({ arrayParser, arrayValues, ...props }) => { // Make sure array* is not passed through
  const {
    list,
    name,
    title,
    addLabel,
    addable,
    onAdd,
    widgets,
    schema,
    uiSchema,
    errorSchema,
    screenType,
    dragging,
    baseFieldUiSchema,
    BaseField,
    propertyUiSchema,
    PropertyComponent,
  } = props;
  const { LabelWidget } = widgets;
  const hasError = isArray(errorSchema) && errorSchema.length && !errorSchema.hidden;
  return (
    <React.Fragment>
      {uiSchema['ui:title'] !== false ? (
        <LabelWidget hasError={hasError} auto={uiSchema['ui:inline']} {...baseFieldUiSchema['ui:titleProps']}>
          {title}
        </LabelWidget>
      ) : null}
      {schema.items.type === 'object' && baseFieldUiSchema.items['ui:title'] !== false && screenType !== 'xs' ? (
        <BaseField
          {...props}
          key={`${name}__title`}
          uiSchema={baseFieldUiSchema}
          propertyUiSchema={adjustUiSchema(propertyUiSchema, -1)}
          widget={PropertyComponent}
          index={-1}
          zIndex={1}
          titleOnly
        />
      ) : null}
      {!list.length ? (
        <BaseField
          {...props}
          key={0}
          uiSchema={baseFieldUiSchema}
          propertyUiSchema={adjustUiSchema(propertyUiSchema, 0)}
          widget={PropertyComponent}
          index={0}
          zIndex={1}
          noTitle={screenType !== 'xs'}
        />
      ) : null}
      {times(list.length, index => (
        <BaseField
          {...props}
          zIndex={dragging === index ? list.length : (list.length - index)}
          key={index}
          uiSchema={baseFieldUiSchema}
          propertyUiSchema={adjustUiSchema(propertyUiSchema, index)}
          widget={PropertyComponent}
          index={index}
          noTitle={screenType !== 'xs'}
        />
      ))}
      {addable ? (
        <Button auto small flat={false} radius type="pink" onPress={onAdd}>
          {addLabel}
        </Button>
      ) : null}
    </React.Fragment>
  );
});

ArrayWidget.custom = true;

export default ArrayWidget;
