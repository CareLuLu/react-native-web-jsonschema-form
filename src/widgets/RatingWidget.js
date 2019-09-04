import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform } from 'react-native';
import View from 'react-native-web-ui-components/View';
import TouchableOpacity from 'react-native-web-ui-components/TouchableOpacity';
import Rating from 'react-native-web-ui-components/Rating';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import createDomStyle from 'react-native-web-ui-components/createDomStyle';
import { useTheme } from 'react-native-web-ui-components/Theme';
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

const useOnTouchableMounted = ({ id, state }) => (ref) => {
  const nextState = { touchable: ref };
  if (Platform.OS === 'web') {
    nextState.pageX = () => document.querySelector(`[data-class~="${id}"]`).getBoundingClientRect().left;
    state.current = nextState; // eslint-disable-line
  } else {
    setTimeout(() => {
      if (nextState.touchable && nextState.touchable.measure) {
        nextState.touchable.measure((fx, fy, width, height, px) => {
          nextState.pageX = () => px;
        });
      } else {
        nextState.pageX = () => 0;
      }
      state.current = nextState; // eslint-disable-line
    });
  }
};

const useOnPress = ({ state, name, onChange }) => (evt) => {
  const x = evt.nativeEvent.pageX - state.current.pageX();
  const value = Math.min(5, Math.ceil(((x / 94) * 5) / 0.5) * 0.5);
  onChange(value, name);
};

const RatingWidget = (preProps) => {
  const props = useTheme('RatingWidget', preProps);

  const {
    name,
    value,
    readonly,
    disabled,
    hasError,
    auto,
    iconName,
    fullStyle,
    emptyStyle,
    themeInputStyle,
    ...nextProps
  } = props;

  const id = `RatingWidget__${name.replace(/\./g, '-')}`;

  const state = useRef();
  const onTouchableMounted = useOnTouchableMounted({ id, state });
  const onPress = useOnPress({ ...props, state });

  if (disabled || readonly) {
    return (
      <View
        style={[
          styles.defaults,
          themeInputStyle.opacity,
          auto ? null : styles.fullWidth,
          nextProps.style,
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
        nextProps.style,
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
};

RatingWidget.propTypes = {
  themeInputStyle: PropTypes.shape().isRequired,
  name: PropTypes.string.isRequired,
  schema: PropTypes.shape({}).isRequired,
  uiSchema: PropTypes.shape({}).isRequired,
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

export default RatingWidget;
