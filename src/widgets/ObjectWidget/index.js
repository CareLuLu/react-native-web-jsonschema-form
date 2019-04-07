import React from 'react';
import PropTypes from 'prop-types';
import createGrid from './createGrid';

class ObjectWidget extends React.Component {
  static propTypes = {
    schema: PropTypes.shape().isRequired,
    uiSchema: PropTypes.shape().isRequired,
    clearCache: PropTypes.bool.isRequired,
  };

  render() {
    const {
      schema,
      uiSchema,
      clearCache,
    } = this.props;

    if (clearCache) {
      this.cache = null;
    }

    if (!this.cache) {
      const grid = uiSchema['ui:grid'] || [{
        type: 'column',
        xs: 12,
        children: Object.keys(schema.properties),
      }];
      this.cache = createGrid(grid, this.props);
    }
    return this.cache(this.props);
  }
}

export default ObjectWidget;
