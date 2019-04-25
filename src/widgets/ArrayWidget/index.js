import React from 'react';
import { StyleSheet } from 'react-native';
import {
  each,
  last,
  times,
  isArray,
} from 'lodash';
import {
  withProps,
  withHandlers,
  withStateHandlers,
  compose,
} from 'recompact';
import { titleize } from 'underscore.string';
import Screen from 'react-native-web-ui-components/Screen';
import {
  getTitle,
  getComponent,
  FIELD_TITLE,
} from '../../utils';
import AddHandle from './AddHandle';
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

const getItem = (schema) => {
  let newItem = '';
  if (schema.items.type === 'object') {
    newItem = {};
  } else if (schema.items.type === 'array') {
    newItem = [];
  }
  return newItem;
};

const formatTitle = title => titleize(title).replace(/ies$/, 'y').replace(/s$/, '');

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

const getProps = ({
  name,
  value,
  schema,
  fields,
  uiSchema,
}) => {
  const screenType = Screen.getType();
  const title = getTitle(uiSchema['ui:title'] || FIELD_TITLE, {
    name,
    value,
    key: last(name.split('.')),
  });
  const propertySchema = schema.items;
  const propertyUiSchema = uiSchema.items;
  const PropertyField = getComponent(propertySchema.type, 'Field', fields);
  const options = uiSchema['ui:options'] || {};

  let adjustedUiSchema = uiSchema;
  const titleProps = uiSchema['ui:titleProps'] || {};
  titleProps.style = [
    styles.label,
    screenType === 'xs' ? styles.labelXs : null,
    titleProps.style || null,
  ];
  adjustedUiSchema = { ...uiSchema, 'ui:titleProps': titleProps };

  const extraProps = {
    title,
    screenType,
    propertySchema,
    propertyUiSchema,
    PropertyField,
    minimumNumberOfItems: (
      options.minimumNumberOfItems === undefined
      || options.minimumNumberOfItems === null
    ) ? 1 : options.minimumNumberOfItems,
    uiSchema: adjustedUiSchema,
    addLabel: options.addLabel || `Add ${formatTitle(title)}`,
    addable: options.addable !== false,
    removable: options.removable !== false,
    orderable: options.orderable !== false,
    AddComponent: options.AddComponent || AddHandle,
    OrderComponent: options.OrderComponent || OrderHandle,
    RemoveComponent: options.RemoveComponent || RemoveHandle,
  };
  return extraProps;
};

const onAddHandler = ({
  name,
  meta,
  value,
  schema,
  onChange,
  minimumNumberOfItems,
}) => () => {
  let nextValue;
  let nextMeta = meta;
  if (value.length < minimumNumberOfItems) {
    nextValue = value.concat(times(minimumNumberOfItems - value.length + 1, () => getItem(schema)));
    if (meta) {
      nextMeta = nextMeta.concat(times(minimumNumberOfItems - value.length + 1, () => ({})));
    }
  } else {
    nextValue = value.concat([getItem(schema)]);
    if (meta) {
      nextMeta = nextMeta.concat([{}]);
    }
  }
  onChange(nextValue, name, {
    nextMeta: nextMeta || false,
  });
};

const onRemoveHandler = ({
  name,
  value,
  onChange,
  reorder,
  errors,
  meta,
}) => (index) => {
  const nextValue = value.filter((v, i) => (i !== index));
  let nextMeta = meta;
  if (meta) {
    nextMeta = nextMeta.filter((v, i) => (i !== index));
  }
  let nextErrors = errors;
  if (errors) {
    nextErrors = nextErrors.filter((v, i) => (i !== index));
  }
  onChange(nextValue, name, {
    nextMeta: nextMeta || false,
    nextErrors: nextErrors || false,
  });
  setTimeout(reorder);
};

const onItemRefHandler = ({ refs }) => (ref, index) => {
  refs[index] = ref; // eslint-disable-line
};

const PropertyComponentHandler = topProps => innerProps => (
  <DraggableItem {...topProps} {...innerProps} />
);

const ArrayWidget = compose(
  withStateHandlers({
    review: 0,
    dragging: null,
    refs: [],
  }, {
    setDragging: (__, { setDragging }) => (dragging) => {
      if (setDragging) {
        setDragging(dragging);
      }
      return { dragging };
    },
    reorder: ({ review }) => () => ({
      review: review + 1,
      dragging: null,
      refs: [],
    }),
  }),
  withProps(getProps),
  withHandlers({
    onAdd: onAddHandler,
    onRemove: onRemoveHandler,
    onItemRef: onItemRefHandler,
  }),
  withHandlers({
    PropertyComponent: PropertyComponentHandler,
  }),
)((props) => {
  const {
    meta,
    review,
    name,
    value,
    title,
    addLabel,
    addable,
    onAdd,
    widgets,
    schema,
    uiSchema,
    errors,
    dragging,
    screenType,
    propertyUiSchema,
    PropertyComponent,
    minimumNumberOfItems,
    AddComponent,
  } = props;
  const { LabelWidget } = widgets;
  const hasError = isArray(errors) && errors.length > 0 && !errors.hidden;
  const hasTitle = uiSchema['ui:title'] !== false;
  const toggleable = !!uiSchema['ui:toggleable'];
  const missingItems = Math.max(0, minimumNumberOfItems - value.length);
  return (
    <React.Fragment>
      {hasTitle || toggleable ? (
        <LabelWidget
          {...props}
          toggleable={toggleable}
          hasTitle={hasTitle}
          hasError={hasError}
          auto={uiSchema['ui:inline']}
          {...uiSchema['ui:titleProps']}
        >
          {title}
        </LabelWidget>
      ) : null}
      {schema.items.type === 'object' && uiSchema.items['ui:title'] !== false && screenType !== 'xs' ? (
        <PropertyComponent
          {...props}
          propertyName={`${name}.title`}
          propertyValue={getItem(schema)}
          propertyErrors={{}}
          propertyMeta={getItem(schema) || {}}
          propertyUiSchema={adjustUiSchema(propertyUiSchema, -1)}
          index={-1}
          zIndex={1}
          titleOnly
        />
      ) : null}
      {times(value.length, index => (
        <PropertyComponent
          {...props}
          key={`${review}.${name}.${index}`}
          propertyName={`${name}.${index}`}
          propertyValue={value[index]}
          propertyMeta={(meta && meta[index]) || getItem(schema) || {}}
          propertyErrors={errors && errors[index]}
          propertyUiSchema={adjustUiSchema(propertyUiSchema, index)}
          index={index}
          zIndex={(dragging === index ? value.length : (value.length - index)) + 1}
          noTitle={screenType !== 'xs'}
        />
      ))}
      {times(missingItems, index => (
        <PropertyComponent
          {...props}
          key={`${review}.${name}.${index}`}
          propertyName={`${name}.${index}`}
          propertyValue={getItem(schema)}
          propertyMeta={getItem(schema) || {}}
          propertyErrors={errors && errors[index]}
          propertyUiSchema={adjustUiSchema(propertyUiSchema, index)}
          index={index}
          zIndex={(dragging === index ? missingItems : (missingItems - index)) + 1}
          noTitle={screenType !== 'xs'}
        />
      ))}
      {addable ? (
        <AddComponent {...props} onPress={onAdd} addLabel={addLabel} />
      ) : null}
    </React.Fragment>
  );
});

export default ArrayWidget;
