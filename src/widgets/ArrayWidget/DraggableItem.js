import React from 'react';
import { StyleSheet } from 'react-native';
import { set } from 'lodash';
import { withProps, withHandlers, compose } from 'recompact';
import { Draggable as RNDraggable } from 'react-native-web-ui-components';
import Item from './Item';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
});

const onDragStartHandler = ({ index, setDragging }) => () => setDragging(index);

const onDragEndHandler = ({
  list,
  name,
  index,
  options,
  uiSchema,
  setDragging,
  formattedValues,
}) => ({ y }) => {
  setDragging(null);
  if (y !== 0) {
    let newList = list;
    let newIndex = index;
    if (list.length > index) {
      const height = uiSchema['ui:inline'] ? 40 : 50;
      const deltaIndex = Math.round(y / height);
      newIndex = Math.max(0, index + deltaIndex);
      const item = newList[index];
      newList = newList.filter((v, i) => (i !== index));
      newList.splice(newIndex, 0, item);
    }
    set(formattedValues, `${name}`.replace(/\.[0-9]+\./g, '[$1]'), newList);
    options.onChangeFormatted(formattedValues, name);
  }
  options.onFocus('');
};

const onRemovePressHandler = ({ index, onRemove }) => () => onRemove(index);

const onFocusHandler = ({ propertyName, options }) => childName => options
  .onFocus(childName || propertyName);

const onChangeHandler = ({ propertyName, options }) => (value, childName) => options
  .onChange(value, childName || propertyName);

const ItemComponentHandler = props => ({ panHandlers }) => (
  <Item {...props} panHandlers={panHandlers} />
);

const DraggableItem = compose(
  withProps(({
    name,
    index,
    errorSchema,
  }) => ({
    handle: `${name}__handle`,
    propertyName: `${name}.${index}`,
    propertyErrorSchema: (errorSchema && errorSchema[index]) || {},
  })),
  withHandlers({
    onDragStart: onDragStartHandler,
    onDragEnd: onDragEndHandler,
    onRemovePress: onRemovePressHandler,
    onFocus: onFocusHandler,
    onChange: onChangeHandler,
  }),
  withHandlers({
    ItemComponent: ItemComponentHandler,
  }),
)((props) => {
  const {
    handle,
    scroller,
    orderable,
    onDragStart,
    onDragEnd,
    ItemComponent,
    titleOnly,
  } = props;
  return (
    <RNDraggable
      handle={handle}
      scroller={scroller}
      style={styles.container}
      disabled={!orderable || titleOnly}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      axis="y"
    >
      {ItemComponent}
    </RNDraggable>
  );
});

export default DraggableItem;
