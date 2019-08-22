import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { get } from 'lodash';
import { withProps, withHandlers, compose } from 'recompact';
import RNDraggable from 'react-native-web-ui-components/Draggable';
import Item from './Item';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
  },
});

const getItemPosition = element => new Promise((resolve) => {
  element.measure((fx, fy, width, height, px, py) => {
    resolve({ x: px, y: py });
  });
});

const findIndex = async (index, position, i, j, refs) => {
  const mid = Math.floor((i + j) / 2);
  const midPosition = await getItemPosition(refs[mid]);
  let before = false;
  if (position.y < midPosition.y) {
    before = true;
  } else if (position.y > midPosition.y) {
    before = false;
  } else if (position.x < midPosition.x) {
    before = true;
  }
  if (i >= j) {
    if (i === index) {
      return index;
    }
    return before ? Math.max(0, (j - 1)) : Math.min((j + 1), refs.length - 1);
  }
  if (before) {
    return findIndex(index, position, i, Math.max(0, mid - 1), refs);
  }
  return findIndex(index, position, mid + 1, j, refs);
};

const onDragStartHandler = ({ index, setDragging }) => () => setDragging(index);

const onDragEndHandler = ({
  name,
  value,
  index,
  refs,
  onChange,
  reorder,
  setDragging,
  errors,
  meta,
}) => async ({ y, x }) => {
  if (y !== 0 || x !== 0) {
    let nextValue = value;
    let nextMeta = meta;
    let nextErrors = errors;
    if (value.length > index) {
      const position = await getItemPosition(refs[index]);
      position.y += y;
      position.x += x;
      let nextIndex;
      if (y < 0) {
        nextIndex = await findIndex(index, position, 0, index, refs);
      } else if (y > 0) {
        nextIndex = await findIndex(index, position, index, value.length - 1, refs);
      } else if (x < 0) {
        nextIndex = await findIndex(index, position, 0, index, refs);
      } else {
        nextIndex = await findIndex(index, position, index, value.length - 1, refs);
      }
      const itemValue = value[index];
      nextValue = value.filter((v, i) => (i !== index));
      nextValue.splice(nextIndex, 0, itemValue);
      if (meta) {
        const itemMeta = nextMeta[index];
        nextMeta = nextMeta.filter((v, i) => (i !== index));
        nextMeta.splice(nextIndex, 0, itemMeta);
      }
      if (errors) {
        const itemError = nextErrors[index];
        nextErrors = nextErrors.filter((v, i) => (i !== index));
        nextErrors.splice(nextIndex, 0, itemError);
      }
    }
    onChange(nextValue, name, {
      nextMeta: nextMeta || false,
      nextErrors: nextErrors || false,
    });
    setTimeout(reorder);
  } else {
    setDragging(null);
  }
};

const onRemovePressHandler = ({ index, onRemove }) => () => onRemove(index);

const onItemRefHandler = ({ index, onItemRef }) => ref => onItemRef(ref, index);

const ItemComponentHandler = ({ style, ...props }) => ({ panHandlers }) => ( // eslint-disable-line
  <Item {...props} itemStyle={style} panHandlers={panHandlers} />
);

const DraggableItem = compose(
  withProps(({ name }) => ({ handle: `${name.replace(/\./g, '_')}__handle` })),
  withHandlers({
    onDragStart: onDragStartHandler,
    onDragEnd: onDragEndHandler,
    onRemovePress: onRemovePressHandler,
    onItemRef: onItemRefHandler,
  }),
  withHandlers({
    ItemComponent: ItemComponentHandler,
  }),
)(({
  handle,
  scroller,
  orderable,
  onDragStart,
  onDragEnd,
  ItemComponent,
  titleOnly,
  uiSchema,
}) => (
  <RNDraggable
    handle={handle}
    scroller={scroller}
    style={[styles.container, get(uiSchema, ['ui:widgetProps', 'style'], null)]}
    disabled={!orderable || titleOnly}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    axis="y"
  >
    {ItemComponent}
  </RNDraggable>
));

DraggableItem.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.arrayOf(PropTypes.any).isRequired,
  index: PropTypes.number.isRequired,
  uiSchema: PropTypes.shape().isRequired,
  onChange: PropTypes.func.isRequired,
  orderable: PropTypes.bool.isRequired,
  titleOnly: PropTypes.bool,
  scroller: PropTypes.shape(),
};

DraggableItem.defaultProps = {
  titleOnly: undefined,
  scroller: undefined,
};

export default DraggableItem;
