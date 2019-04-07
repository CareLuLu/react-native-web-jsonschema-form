import AbstractField from './AbstractField';

class IntegerField extends AbstractField {
  getDefaultWidget() {
    const { widgets } = this.props;
    return widgets.IntegerWidget;
  }
}

export default IntegerField;
