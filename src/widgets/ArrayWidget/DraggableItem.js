import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { get, omit } from 'lodash';
import RNDraggable from 'react-native-web-ui-components/Draggable';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import getItemPosition from './getItemPosition';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
  },
});

const findIndex = async (index, position, pos, i, j, refs, positions) => {
  const mid = Math.floor((i + j) / 2);

  let midPosition = positions[mid];
  if (!midPosition) {
    midPosition = await getItemPosition(refs[mid]);
  }

  const yThreshold = midPosition.y + (midPosition.height / 2);
  const xThreshold = midPosition.x + (midPosition.width / 2);

  let before;
  if (position.y + position.height < yThreshold) { // Item is in a line before midItem's line
    before = true;
  } else if (position.y > yThreshold) { // Item is in a line after midItem's line
    before = false;
  } else if (position.x + position.width < xThreshold) {
    before = true; // Item is in a column before midItem's column
  } else if (position.x > xThreshold) {
    before = false; // Item is in a column after midItem's column
  } else if (index === mid) {
    return index;
  } else {
    before = index < mid; // Keep same relative position
  }

  if (i >= j) {
    return before ? pos : i;
  }

  const nextI = before ? i : Math.min(j, mid + 1);
  const nextJ = before ? Math.max(i, mid - 1) : j;
  const nextPos = before ? Math.min(pos, mid) : mid;

  return findIndex(index, position, nextPos, nextI, nextJ, refs, positions);
};

const useOnDragStart = ({ index, setDragging }) => () => setDragging(index);

const useOnDragEnd = ({
  name,
  value,
  index,
  refs,
  onChange,
  reorder,
  setDragging,
  errors,
  meta,
  positions,
}) => async ({ y, x }) => {
  if (y !== 0 || x !== 0) {
    let nextValue = value;
    let nextMeta = meta;
    let nextErrors = errors;
    if (value.length > 1) {
      let position = positions[index];
      if (!position) {
        position = await getItemPosition(refs[index]);
      } else {
        position = {
          ...position,
          y: position.y + y,
          x: position.x + x,
        };
      }

      const nextIndex = await findIndex(
        index,
        position,
        index,
        0,
        value.length - 1,
        refs,
        positions,
      );

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

const useOnRemovePress = ({ index, onRemove }) => () => onRemove(index);

const useOnItemRef = ({ index, onItemRef }) => ref => onItemRef(ref, index);

const DraggableItem = (props) => {
  const {
    name,
    scroller,
    orderable,
    titleOnly,
    uiSchema,
    style,
    axis,
    Item,
  } = props;

  const handle = `${name.replace(/\./g, '_')}__handle`;

  const onDragStart = useOnDragStart(props);
  const onDragEnd = useOnDragEnd(props);
  const onRemovePress = useOnRemovePress(props);
  const onItemRef = useOnItemRef(props);

  return (
    <RNDraggable
      handle={handle}
      scroller={scroller}
      style={[styles.container, get(uiSchema, ['ui:widgetProps', 'style'], null)]}
      disabled={!orderable || titleOnly}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      axis={axis}
    >
      {({ panHandlers }) => (
        <Item
          {...omit(props, 'style')}
          handle={handle}
          itemStyle={style}
          panHandlers={panHandlers}
          onItemRef={onItemRef}
          onRemovePress={onRemovePress}
        />
      )}
    </RNDraggable>
  );
};

DraggableItem.propTypes = {
  Item: PropTypes.elementType.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.arrayOf(PropTypes.any).isRequired,
  index: PropTypes.number.isRequired,
  uiSchema: PropTypes.shape().isRequired,
  onChange: PropTypes.func.isRequired,
  orderable: PropTypes.bool.isRequired,
  titleOnly: PropTypes.bool,
  scroller: PropTypes.shape(),
  axis: PropTypes.string,
  style: StylePropType,
};

DraggableItem.defaultProps = {
  titleOnly: undefined,
  scroller: undefined,
  axis: 'y',
  style: {},
};

export default DraggableItem;
