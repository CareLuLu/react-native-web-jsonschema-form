import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { withProps, withHandlers, compose } from 'recompact';
import {
  View,
  Rating,
  StylePropType,
  createDomStyle,
} from 'react-native-web-ui-components';
import { withTheme } from 'react-native-web-ui-components/Theme';
import { Helmet, style } from 'react-native-web-ui-components/Helmet';

/* eslint react/destructuring-assignment: 0 */

const styles = StyleSheet.create({
  defaults: {
    height: 20,
    marginBottom: 10,
  },
  full: {
    color: '#FEC430',
  },
  empty: {
    color: '#C0C0C0',
  },
  fullWidth: {
    width: '100%',
  },
  auto: {
    marginBottom: 0,
  },
});

const RatingWidget = compose(
  withProps(({ name }) => ({
    id: `RatingWidget__${name.replace(/\./g, '-')}`,
  })),
  withHandlers(() => {
    const state = {
      touchable: null,
      pageX: null,
    };
    return {
      onTouchableMounted: ({ id }) => (ref) => {
        state.touchable = ref;
        if (Platform.OS === 'web') {
          state.pageX = () => document.getElementsByClassName(id)[0].getBoundingClientRect().left;
        } else {
          setTimeout(() => {
            if (state.touchable && state.touchable.measure) {
              state.touchable.measure((fx, fy, width, height, px) => {
                state.pageX = () => px;
              });
            } else {
              state.pageX = () => 0;
            }
          });
        }
      },
      onPress: ({ onChange, onFocus }) => (evt) => {
        const x = evt.nativeEvent.pageX - state.pageX();
        const value = Math.min(5, Math.ceil(((x / 94) * 5) / 0.5) * 0.5);
        onFocus();
        onChange(value);
      },
    };
  }),
)(({
  id,
  name,
  value,
  readonly,
  disabled,
  hasError,
  onPress,
  auto,
  iconName,
  fullStyle,
  emptyStyle,
  onTouchableMounted,
  themeInputStyle,
  ...props
}) => {
  if (disabled || readonly) {
    return (
      <View
        style={[
          styles.defaults,
          themeInputStyle.opacity,
          auto ? null : styles.fullWidth,
          props.style,
        ]}
      >
        <Rating
          disabled={disabled}
          readonly={readonly}
          hasError={hasError}
          iconName={iconName}
          fullStyle={fullStyle}
          emptyStyle={emptyStyle}
          rating={parseFloat(value)}
        />
      </View>
    );
  }
  return (
    <TouchableOpacity
      ref={onTouchableMounted}
      className={id}
      style={[
        styles.defaults,
        themeInputStyle.opacity,
        auto ? styles.auto : styles.fullWidth,
        props.style,
      ]}
      onPress={onPress}
    >
      <Helmet>
        <style>
          {`
            .${id}:hover {
              cursor: pointer;
            }
            .${id}:hover .Rating__group {
              ${createDomStyle(fullStyle)}
            }
            .${id}:hover .Rating {
              color: inherit;
            }
            .${id} .Rating__group:hover,
            .${id} .Rating__group:hover ~ .Rating__group {
              ${createDomStyle(emptyStyle)}
            }
            .${id} .Rating:hover {
              ${createDomStyle(fullStyle)}
            }
            ${Array(10).fill(0).map((v, i) => `.${id} .Rating__${(2 * i) + 1}:hover + .Rating__${2 * i}`).join(',')} {
              ${createDomStyle(fullStyle)}
            }
          `}
        </style>
      </Helmet>
      <Rating
        disabled={disabled}
        readonly={readonly}
        hasError={hasError}
        fullStyle={fullStyle}
        emptyStyle={emptyStyle}
        rating={parseFloat(value)}
      />
    </TouchableOpacity>
  );
});

RatingWidget.propTypes = {
  themeInputStyle: PropTypes.shape().isRequired,
  name: PropTypes.string.isRequired,
  schema: PropTypes.shape({}).isRequired,
  uiSchema: PropTypes.shape({}).isRequired,
  onFocus: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  hasError: PropTypes.bool,
  auto: PropTypes.bool,
  iconName: PropTypes.string,
  fullStyle: StylePropType,
  emptyStyle: StylePropType,
};

RatingWidget.defaultProps = {
  value: 0,
  readonly: false,
  disabled: false,
  hasError: false,
  auto: false,
  iconName: 'star',
  fullStyle: styles.full,
  emptyStyle: styles.empty,
};

export default withTheme('RatingWidget')(RatingWidget);
