import AbstractEnumerableField from './AbstractEnumerableField';

class IntegerField extends AbstractEnumerableField {
  getDefaultWidget() {
    const { widgets } = this.props;
    return widgets.IntegerWidget;
  }
}

export default IntegerField;
