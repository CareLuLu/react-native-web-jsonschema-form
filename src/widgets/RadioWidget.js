import React from 'react';
import { Radiobox } from 'react-native-web-ui-components';
import CheckboxWidget from './CheckboxWidget';

const RadioWidget = props => <CheckboxWidget {...props} Wrapper={Radiobox} />;

export default RadioWidget;
