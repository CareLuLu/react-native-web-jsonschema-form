import AbstractField from './AbstractField';

class ArrayField extends AbstractField {
  getDefaultWidget() {
    const { widgets } = this.props;
    return widgets.ArrayWidget;
  }
}

export default ArrayField;
