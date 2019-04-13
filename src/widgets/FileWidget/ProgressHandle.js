import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import View from 'react-native-web-ui-components/View';
import Row from 'react-native-web-ui-components/Row';
import { Helmet, style } from 'react-native-web-ui-components/Helmet';

const styles = StyleSheet.create({
  progress: {
    position: 'absolute',
    top: 29,
    left: 0,
    width: '100%',
  },
  full: {
    height: 2,
  },
  empty: {
    height: 2,
    backgroundColor: '#C8C8C8',
  },
});

const ProgressHandle = ({ meta, theme }) => (
  <React.Fragment>
    <Helmet>
      <style>
        {`
          .FileWidget__progress {
            transition: width 0.5s;
          }
        `}
      </style>
    </Helmet>
    {meta['ui:progress'] !== undefined && meta['ui:progress'] < 100 ? (
      <Row style={styles.progress}>
        <View
          className="FileWidget__progress"
          style={[
            styles.full,
            {
              width: `${meta['ui:progress']}%`,
              backgroundColor: StyleSheet.flatten(theme.input.regular.selected).color,
            },
          ]}
        />
        <View className="FileWidget__progress" style={[styles.empty, { width: `${(100 - meta['ui:progress'])}%` }]} />
      </Row>
    ) : null}
  </React.Fragment>
);

ProgressHandle.propTypes = {
  theme: PropTypes.shape().isRequired,
  meta: PropTypes.shape().isRequired,
};

export default ProgressHandle;
