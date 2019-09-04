import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import View from 'react-native-web-ui-components/View';
import Text from 'react-native-web-ui-components/Text';
import Link from 'react-native-web-ui-components/Link';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import TextInputWidget from '../TextInputWidget';
import EditHandle from './EditHandle';
import SaveHandle from './SaveHandle';
import CancelHandle from './CancelHandle';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  defaults: {
    height: 40,
  },
  fullWidth: {
    width: '100%',
  },
  auto: {
    marginBottom: 0,
  },
  main: {
    flex: 1,
  },
  text: {
    height: 40,
    borderWidth: 1,
    borderColor: 'transparent',
    lineHeight: 40,
    overflow: 'hidden',
  },
});

class TextWidget extends React.Component {
  static propTypes = {
    theme: PropTypes.shape().isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    auto: PropTypes.bool,
    style: StylePropType,
    textStyle: StylePropType,
    textContainerStyle: StylePropType,
    inputStyle: StylePropType,
    inputContainerStyle: StylePropType,
    editable: PropTypes.bool,
    EditComponent: PropTypes.elementType,
    SaveComponent: PropTypes.elementType,
    CancelComponent: PropTypes.elementType,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  };

  static defaultProps = {
    value: null,
    to: null,
    auto: false,
    style: null,
    textStyle: null,
    textContainerStyle: null,
    inputStyle: null,
    inputContainerStyle: null,
    editable: true,
    EditComponent: EditHandle,
    SaveComponent: SaveHandle,
    CancelComponent: CancelHandle,
    children: null,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.value !== prevState.value) {
      return {
        value: nextProps.value,
        displayValue: nextProps.value,
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    const { value } = props;
    this.state = {
      value,
      editing: false,
      displayValue: value,
    };
  }

  onChange = value => this.setState({ displayValue: value });

  onSave = () => {
    const { name, onChange } = this.props;
    const { displayValue } = this.state;
    this.setState({
      editing: false,
      value: displayValue,
    });
    setTimeout(() => onChange(displayValue, name));
  };

  onCancel = () => {
    const { value } = this.state;
    this.setState({
      editing: false,
      displayValue: value,
    });
  };

  onEdit = () => this.setState({ editing: true });

  renderChildren(element) {
    if (typeof element === 'function') {
      const Component = element;
      return <Component {...this.props} />;
    }
    return element;
  }

  render() {
    const {
      to,
      theme,
      auto,
      style,
      textStyle,
      textContainerStyle,
      inputStyle,
      inputContainerStyle,
      editable,
      EditComponent,
      SaveComponent,
      CancelComponent,
      children,
    } = this.props;
    const { editing, displayValue, value } = this.state;
    let href = null;
    if (to) {
      href = typeof to === 'function' ? to(this.props) : to;
    }
    return (
      <View
        style={[
          styles.container,
          styles.defaults,
          auto ? styles.auto : styles.fullWidth,
          style,
        ]}
      >
        {editing ? (
          <React.Fragment>
            <View style={[auto ? null : styles.main, inputContainerStyle]}>
              <TextInputWidget
                {...this.props}
                auto
                style={[styles.fullWidth, inputStyle]}
                value={displayValue}
                onChange={this.onChange}
              />
              {this.renderChildren(children)}
            </View>
            <SaveComponent {...this.props} to={undefined} onPress={this.onSave} />
            <CancelComponent {...this.props} to={undefined} onPress={this.onCancel} />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <View style={[auto ? null : styles.main, textContainerStyle]}>
              {!href ? (
                <Text
                  style={[
                    theme.input.regular.text,
                    styles.defaults,
                    styles.text,
                    styles.fullWidth,
                    textStyle,
                  ]}
                >
                  {value !== null && value !== undefined ? value : ''}
                </Text>
              ) : (
                <Link
                  to={href}
                  blank
                  type={theme.colors.primary}
                  style={[
                    styles.defaults,
                    styles.text,
                    styles.fullWidth,
                    textStyle,
                  ]}
                >
                  {value !== null && value !== undefined ? value : ''}
                </Link>
              )}
              {this.renderChildren(children)}
            </View>
            {editable ? (
              <EditComponent
                {...this.props}
                to={undefined}
                onPress={this.onEdit}
              />
            ) : null}
          </React.Fragment>
        )}
      </View>
    );
  }
}

export default TextWidget;
