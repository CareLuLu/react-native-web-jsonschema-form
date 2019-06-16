import AbstractEnumerableField from './AbstractEnumerableField';

class NumberField extends AbstractEnumerableField {
  getDefaultWidget() {
    const { widgets } = this.props;
    return widgets.NumberWidget;
  }
}

export default NumberField;
