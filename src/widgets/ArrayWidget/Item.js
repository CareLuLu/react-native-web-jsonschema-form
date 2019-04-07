import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform, View as RNView } from 'react-native';
import { noop } from 'lodash';
import Row from 'react-native-web-ui-components/Row';
import View from 'react-native-web-ui-components/View';
import StylePropType from 'react-native-web-ui-components/StylePropType';

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
});

const Wrapper = ({ children, style, ...props }) => {
  const { value, index } = props;
  const zIndex = { zIndex: value.length - index };
  if (Platform.OS === 'web') {
    const css = {
      display: 'flex',
      alignItems: 'flex-start',
      width: '100%',
      flexDirection: 'row',
      ...zIndex,
      ...style,
    };
    return React.createElement('div', { ...props, style: css }, children);
  }
  return (
    <Row style={[styles.container, zIndex]}>
      {children}
    </Row>
  );
};

Wrapper.propTypes = {
  value: PropTypes.arrayOf(PropTypes.any).isRequired,
  index: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
  style: StylePropType,
};

Wrapper.defaultProps = {
  style: {},
};

const Item = ({
  onItemRef,
  panHandlers,
  style,
  onMouseDown,
  onTouchStart,
  onMouseUp,
  onTouchEnd,
  propertyName,
  propertyValue,
  propertySchema,
  propertyErrors,
  PropertyField,
  RemoveComponent,
  OrderComponent,
  ...props
}) => {
  const {
    value,
    index,
    removable,
    orderable,
    screenType,
    propertyUiSchema,
  } = props;
  return (
    <React.Fragment>
      <Wrapper
        style={style}
        value={value}
        index={index}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
      >
        {orderable ? (
          <OrderComponent {...props} panHandlers={panHandlers} />
        ) : null}
        <RNView ref={onItemRef} style={styles.main}>
          <PropertyField
            {...props}
            name={propertyName}
            schema={propertySchema}
            uiSchema={propertyUiSchema}
            errors={propertyErrors}
            value={propertyValue}
          />
        </RNView>
        {removable && screenType !== 'xs' ? (
          <RemoveComponent {...props} />
        ) : null}
      </Wrapper>
      {removable && screenType === 'xs' ? (
        <RemoveComponent {...props} />
      ) : null}
    </React.Fragment>
  );
};

Item.propTypes = {
  value: PropTypes.arrayOf(PropTypes.any).isRequired,
  index: PropTypes.number.isRequired,
  focus: PropTypes.string.isRequired,
  screenType: PropTypes.string.isRequired,
  propertyName: PropTypes.string.isRequired,
  propertyValue: PropTypes.any.isRequired, // eslint-disable-line
  propertySchema: PropTypes.shape().isRequired,
  propertyUiSchema: PropTypes.shape().isRequired,
  orderable: PropTypes.bool.isRequired,
  removable: PropTypes.bool.isRequired,
  OrderComponent: PropTypes.elementType.isRequired,
  RemoveComponent: PropTypes.elementType.isRequired,
  PropertyField: PropTypes.elementType.isRequired,
  onItemRef: PropTypes.func.isRequired,
  panHandlers: PropTypes.shape(),
  style: StylePropType,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onTouchStart: PropTypes.func,
  onTouchEnd: PropTypes.func,
  propertyErrors: PropTypes.any, // eslint-disable-line
};

Item.defaultProps = {
  panHandlers: {},
  style: null,
  onMouseDown: noop,
  onMouseUp: noop,
  onTouchStart: noop,
  onTouchEnd: noop,
  propertyErrors: undefined,
};

export default Item;
