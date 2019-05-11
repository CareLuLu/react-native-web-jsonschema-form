import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform, View as RNView } from 'react-native';
import { noop } from 'lodash';
import Row from 'react-native-web-ui-components/Row';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import RemoveHandle from './RemoveHandle';

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
});

const Wrapper = ({
  children,
  style,
  itemStyle,
  zIndex,
  ...props
}) => {
  if (Platform.OS === 'web') {
    const css = {
      display: 'flex',
      alignItems: 'flex-start',
      width: '100%',
      flexDirection: 'row',
      zIndex,
      ...StyleSheet.flatten(itemStyle),
      ...style,
    };
    return React.createElement('div', { ...props, style: css }, children);
  }
  return (
    <Row style={[styles.container, itemStyle, zIndex]}>
      {children}
    </Row>
  );
};

Wrapper.propTypes = {
  zIndex: PropTypes.number.isRequired,
  value: PropTypes.arrayOf(PropTypes.any).isRequired,
  index: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
  style: StylePropType,
  itemStyle: StylePropType,
};

Wrapper.defaultProps = {
  style: {},
  itemStyle: {},
};

const Item = ({
  onItemRef,
  panHandlers,
  style,
  zIndex,
  itemStyle,
  onMouseDown,
  onTouchStart,
  onMouseUp,
  onTouchEnd,
  onClick,
  propertyName,
  propertyValue,
  propertySchema,
  propertyMeta,
  propertyErrors,
  PropertyField,
  RemoveComponent,
  OrderComponent,
  ...props
}) => {
  const {
    value,
    index,
    auto,
    removable,
    orderable,
    screenType,
    propertyUiSchema,
  } = props;
  return (
    <React.Fragment>
      <Wrapper
        itemStyle={itemStyle}
        style={style}
        value={value}
        index={index}
        zIndex={zIndex}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        onClick={onClick}
      >
        {orderable ? (
          <OrderComponent {...props} panHandlers={panHandlers} />
        ) : null}
        <RNView ref={onItemRef} style={auto ? null : styles.main}>
          <PropertyField
            {...props}
            name={propertyName}
            schema={propertySchema}
            uiSchema={propertyUiSchema}
            errors={propertyErrors}
            value={propertyValue}
            meta={propertyMeta}
          />
        </RNView>
        {removable && (screenType !== 'xs' || RemoveComponent !== RemoveHandle) ? (
          <RemoveComponent {...props} />
        ) : null}
      </Wrapper>
      {removable && screenType === 'xs' && RemoveComponent === RemoveHandle ? (
        <RemoveComponent {...props} />
      ) : null}
    </React.Fragment>
  );
};

Item.propTypes = {
  value: PropTypes.arrayOf(PropTypes.any).isRequired,
  index: PropTypes.number.isRequired,
  zIndex: PropTypes.number.isRequired,
  focus: PropTypes.string.isRequired,
  screenType: PropTypes.string.isRequired,
  propertyName: PropTypes.string.isRequired,
  propertyValue: PropTypes.any.isRequired, // eslint-disable-line
  propertySchema: PropTypes.shape().isRequired,
  propertyUiSchema: PropTypes.shape().isRequired,
  propertyMeta: PropTypes.any.isRequired, // eslint-disable-line
  orderable: PropTypes.bool.isRequired,
  removable: PropTypes.bool.isRequired,
  OrderComponent: PropTypes.elementType.isRequired,
  RemoveComponent: PropTypes.elementType.isRequired,
  PropertyField: PropTypes.elementType.isRequired,
  onItemRef: PropTypes.func.isRequired,
  panHandlers: PropTypes.shape(),
  auto: PropTypes.bool,
  style: StylePropType,
  itemStyle: StylePropType,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onTouchStart: PropTypes.func,
  onTouchEnd: PropTypes.func,
  onClick: PropTypes.func,
  propertyErrors: PropTypes.any, // eslint-disable-line
};

Item.defaultProps = {
  panHandlers: {},
  auto: false,
  style: null,
  itemStyle: null,
  onMouseDown: noop,
  onMouseUp: noop,
  onTouchStart: noop,
  onTouchEnd: noop,
  onClick: noop,
  propertyErrors: undefined,
};

export default Item;
