import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform } from 'react-native';
import { withProps, withHandlers, compose } from 'recompact';
import View from 'react-native-web-ui-components/View';
import TouchableOpacity from 'react-native-web-ui-components/TouchableOpacity';
import Rating from 'react-native-web-ui-components/Rating';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import createDomStyle from 'react-native-web-ui-components/createDomStyle';
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
          state.pageX = () => document.querySelector(`[data-class~="${id}"]`).getBoundingClientRect().left;
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
      onPress: ({ name, onChange }) => (evt) => {
        const x = evt.nativeEvent.pageX - state.pageX();
        const value = Math.min(5, Math.ceil(((x / 94) * 5) / 0.5) * 0.5);
        onChange(value, name);
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
  const fullCss = createDomStyle([styles.full, fullStyle]);
  const emptyCss = createDomStyle([styles.empty, emptyStyle]);
  return (
    <TouchableOpacity
      onRef={onTouchableMounted}
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
            [data-class~="${id}"]:hover {
              cursor: pointer;
            }
            [data-class~="${id}"]:hover [data-class~="Rating__group"] {
              ${fullCss}
            }
            [data-class~="${id}"]:hover [data-class~="Rating"] {
              color: inherit;
            }
            [data-class~="${id}"] [data-class~="Rating__group"]:hover,
            [data-class~="${id}"] [data-class~="Rating__group"]:hover ~ [data-class~="Rating__group"] {
              ${emptyCss}
            }
            [data-class~="${id}"] [data-class~="Rating"]:hover {
              ${fullCss}
            }
            ${Array(10).fill(0).map((v, i) => `[data-class~="${id}"] [data-class~="Rating__${(2 * i) + 1}"]:hover + [data-class~="Rating__${2 * i}"]`).join(',')} {
              ${fullCss}
            }
          `}
        </style>
      </Helmet>
      <Rating
        disabled={disabled}
        readonly={readonly}
        hasError={hasError}
        iconName={iconName}
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
