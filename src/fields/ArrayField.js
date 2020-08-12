import React from 'react';
import { isString } from 'lodash';
import AbstractField from './AbstractField';

class ArrayField extends AbstractField {
  getDefaultWidget() {
    const { widgets } = this.props;
    return widgets.ArrayWidget;
  }

  renderErrors() {
    let { errors } = this.props;
    const { widgets, uiSchema } = this.props;

    const { ErrorWidget } = widgets;

    if (uiSchema['ui:widget'] === 'tagInput') {
      errors = errors.__originalValues || []; // eslint-disable-line
    }
    errors = errors.filter(error => isString(error));

    return errors.map((error, i) => (
      <ErrorWidget
        uiSchema={uiSchema}
        key={error}
        first={i === 0}
        last={i === errors.length - 1}
        auto={uiSchema['ui:inline']}
        {...(uiSchema['ui:errorProps'] || {})}
      >
        {error}
      </ErrorWidget>
    ));
  }
}

export default ArrayField;
