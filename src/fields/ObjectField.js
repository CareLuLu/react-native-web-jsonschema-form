import AbstractField from './AbstractField';

class ObjectField extends AbstractField {
  getDefaultWidget() {
    const { widgets } = this.props;
    return widgets.ObjectWidget;
  }
}

export default ObjectField;
