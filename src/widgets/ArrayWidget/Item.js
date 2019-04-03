import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform } from 'react-native';
import { View, Row, StylePropType } from 'react-native-web-ui-components';

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
});

const Wrapper = ({ children, style, ...props }) => {
  if (Platform.OS === 'web') {
    const css = {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      flexDirection: 'row',
      ...style,
    };
    return React.createElement('div', { ...props, style: css }, children);
  }
  return (
    <Row style={styles.container}>
      {children}
    </Row>
  );
};

Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
  style: StylePropType,
};

Wrapper.defaultProps = {
  style: {},
};

const Item = ({
  panHandlers,
  style,
  onMouseDown,
  onTouchStart,
  onMouseUp,
  onTouchEnd,
  ...props
}) => {
  const {
    focus,
    screenType,
    propertyName,
    propertySchema,
    propertyUiSchema,
    propertyErrorSchema,
    onFocus,
    onChange,
    orderable,
    removable,
    OrderComponent,
    RemoveComponent,
    PropertyField,
  } = props;
  return (
    <React.Fragment>
      <Wrapper
        style={style}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
      >
        {orderable ? (
          <OrderComponent {...props} panHandlers={panHandlers} />
        ) : null}
        <View style={styles.main}>
          <PropertyField
            {...props}
            name={propertyName}
            schema={propertySchema}
            uiSchema={propertyUiSchema}
            errorSchema={propertyErrorSchema}
            onChange={onChange}
            onFocus={onFocus}
            focusFirst={focus === propertyName}
            disabled={!!propertyUiSchema['ui:disabled']}
            readonly={!!propertyUiSchema['ui:readonly']}
          />
        </View>
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

export default Item;
