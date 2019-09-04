import React from 'react';
import Radiobox from 'react-native-web-ui-components/Radiobox';
import CheckboxWidget from './CheckboxWidget';

const RadioWidget = props => <CheckboxWidget {...props} Wrapper={Radiobox} uncheckable={false} />;

export default RadioWidget;
