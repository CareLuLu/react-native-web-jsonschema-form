import AbstractField from './AbstractField';

class NumberField extends AbstractField {
  getDefaultWidget() {
    const { widgets } = this.props;
    return widgets.NumberWidget;
  }
}

export default NumberField;
