import AbstractField from './AbstractField';

class NullField extends AbstractField {
  getDefaultWidget() {
    const { widgets } = this.props;
    return widgets.HiddenWidget;
  }
}

export default NullField;
