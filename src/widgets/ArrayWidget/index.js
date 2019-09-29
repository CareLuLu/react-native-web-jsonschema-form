import React, { useState } from 'react';
import {
  noop,
  each,
  last,
  times,
  isArray,
  isFunction,
} from 'lodash';
import { titleize } from 'underscore.string';
import Screen from 'react-native-web-ui-components/Screen';
import Icon from 'react-native-web-ui-components/Icon';
import {
  getTitle,
  getComponent,
  FIELD_TITLE,
} from '../../utils';
import getItemPosition from './getItemPosition';
import AddHandle from './AddHandle';
import OrderHandle from './OrderHandle';
import RemoveHandle from './RemoveHandle';
import Item from './Item';
import DraggableItem from './DraggableItem';

/* eslint react/no-array-index-key: 0 */

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

const adjustUiSchema = (possibleUiSchema, i, props) => {
  let uiSchema = possibleUiSchema;
  if (isFunction(possibleUiSchema['ui:iterate'])) {
    uiSchema = possibleUiSchema['ui:iterate'](i, props);
  }
  const adjustedUiSchema = iterateUiSchema(uiSchema, i);
  each(uiSchema, (uis, key) => {
    if (!/^ui:/.test(key)) {
      adjustedUiSchema[key] = iterateUiSchema(uis, i);
    }
  });
  return adjustedUiSchema;
};

const getProps = (props) => {
  const {
    name,
    value,
    schema,
    fields,
    uiSchema,
  } = props;

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

  const extraProps = {
    title,
    screenType,
    propertySchema,
    propertyUiSchema,
    PropertyField,
    axis: options.axis || 'y',
    minimumNumberOfItems: (
      options.minimumNumberOfItems === undefined
      || options.minimumNumberOfItems === null
    ) ? 1 : options.minimumNumberOfItems,
    addLabel: options.addLabel || `Add ${formatTitle(title)}`,
    removeLabel: options.removeLabel || 'Remove',
    orderLabel: options.orderLabel || <Icon name="th" />,
    removeStyle: options.removeStyle,
    orderStyle: options.orderStyle,
    addable: options.addable !== false,
    removable: options.removable !== false,
    orderable: options.orderable !== false,
    AddComponent: options.AddComponent || AddHandle,
    OrderComponent: options.OrderComponent || OrderHandle,
    RemoveComponent: options.RemoveComponent || RemoveHandle,
    ItemComponent: options.ItemComponent || Item,
  };
  return { ...props, ...extraProps };
};

const useOnAdd = ({
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

const useOnRemove = ({
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

const useOnItemRef = ({ refs, positions }) => (ref, index) => {
  refs[index] = ref; // eslint-disable-line
  setTimeout(() => {
    getItemPosition(ref).then((position) => {
      positions[index] = position; // eslint-disable-line
    }).catch(noop);
  }, 100);
};

const useSetDragging = ({ setDragging, setState }) => (dragging) => {
  if (setDragging) {
    setDragging(dragging);
  }
  setState(current => ({ ...current, dragging }));
};

const useReorder = ({ review, setState }) => () => setState({
  refs: [],
  positions: [],
  review: review + 1,
  dragging: null,
});

const ArrayWidget = (props) => {
  const [state, setState] = useState({
    refs: [],
    positions: [],
    review: 0,
    dragging: null,
  });

  const setDragging = useSetDragging({ ...props, setState });
  const params = getProps({ ...props, ...state, setDragging });
  const reorder = useReorder({ ...params, setState });

  const onAdd = useOnAdd(params);
  const onRemove = useOnRemove({ ...params, reorder });
  const onItemRef = useOnItemRef(params);

  const {
    meta,
    review,
    name,
    value,
    title,
    addLabel,
    addable,
    widgets,
    schema,
    uiSchema,
    errors,
    dragging,
    screenType,
    propertyUiSchema,
    minimumNumberOfItems,
    AddComponent,
    ItemComponent,
  } = params;

  const { LabelWidget } = widgets;
  const hasError = isArray(errors) && errors.length > 0 && !errors.hidden;
  const hasTitle = uiSchema['ui:title'] !== false;
  const toggleable = !!uiSchema['ui:toggleable'];
  const missingItems = Math.max(0, minimumNumberOfItems - value.length);

  return (
    <React.Fragment>
      {hasTitle || toggleable ? (
        <LabelWidget
          {...params}
          toggleable={toggleable}
          hasTitle={hasTitle}
          hasError={hasError}
          auto={uiSchema['ui:inline']}
          {...(uiSchema['ui:titleProps'] || {})}
        >
          {title}
        </LabelWidget>
      ) : null}
      {schema.items.type === 'object' && uiSchema.items['ui:title'] !== false && screenType !== 'xs' ? (
        <DraggableItem
          {...params}
          reorder={reorder}
          onRemove={onRemove}
          onItemRef={onItemRef}
          propertyName={`${name}.title`}
          propertyValue={getItem(schema)}
          propertyErrors={{}}
          propertyMeta={getItem(schema) || {}}
          propertyUiSchema={adjustUiSchema(propertyUiSchema, -1, params)}
          index={-1}
          zIndex={1}
          Item={ItemComponent}
          titleOnly
        />
      ) : null}
      {times(value.length, (index) => {
        const itemUiSchema = adjustUiSchema(propertyUiSchema, index, params);
        return (
          <DraggableItem
            {...params}
            reorder={reorder}
            onRemove={onRemove}
            onItemRef={onItemRef}
            key={`${review}.${name}.${index}`}
            propertyName={`${name}.${index}`}
            propertyValue={value[index]}
            propertyMeta={(meta && meta[index]) || getItem(schema) || {}}
            propertyErrors={errors && errors[index]}
            propertyUiSchema={itemUiSchema}
            index={index}
            zIndex={(dragging === index ? value.length : (value.length - index)) + 1}
            Item={ItemComponent}
            noTitle={screenType !== 'xs' && itemUiSchema['ui:noTitle'] !== false}
          />
        );
      })}
      {times(missingItems, (index) => {
        const itemUiSchema = adjustUiSchema(propertyUiSchema, value.length + index, params);
        return (
          <DraggableItem
            {...params}
            reorder={reorder}
            onRemove={onRemove}
            onItemRef={onItemRef}
            key={`${review}.${name}.${value.length + index}`}
            propertyName={`${name}.${value.length + index}`}
            propertyValue={getItem(schema)}
            propertyMeta={getItem(schema) || {}}
            propertyErrors={errors && errors[index]}
            propertyUiSchema={itemUiSchema}
            index={index}
            zIndex={(dragging === index ? missingItems : (missingItems - index)) + 1}
            Item={ItemComponent}
            noTitle={screenType !== 'xs' && itemUiSchema['ui:noTitle'] !== false}
          />
        );
      })}
      {addable ? (
        <AddComponent {...params} onPress={onAdd} addLabel={addLabel} />
      ) : null}
    </React.Fragment>
  );
};

export default ArrayWidget;
