import AbstractField from './AbstractField';

const password = /password$/i;
const email = /(email|username)$/i;
const phone = /(phone|mobile|cellphone)$/i;
const message = /(message|text|notes)$/i;
const zip = /zip$/i;

class StringField extends AbstractField {
  getDefaultWidget() {
    const { name, widgets, schema } = this.props;
    let Widget;
    if (schema.format === 'date-time') {
      Widget = widgets.DateWidget;
    } else if (password.test(name)) {
      Widget = widgets.PasswordWidget;
    } else if (email.test(name)) {
      Widget = widgets.EmailWidget;
    } else if (phone.test(name)) {
      Widget = widgets.PhoneWidget;
    } else if (message.test(name)) {
      Widget = widgets.TextareaWidget;
    } else if (zip.test(name)) {
      Widget = widgets.ZipWidget;
    } else {
      Widget = widgets.TextInputWidget;
    }
    return Widget;
  }
}

export default StringField;
