# react-native-web-jsonschema-form

Render customizable forms using [JSON schema](http://json-schema.org/) for responsive websites and [Expo](https://expo.io/) apps (both iOS and Android). This library was inpired on [react-jsonschema-form](https://github.com/mozilla-services/react-jsonschema-form) but was built with [React Native](https://facebook.github.io/react-native/) and [React Native Web](https://github.com/necolas/react-native-web) in mind.

## Installation

1) This library is backed by [react-native-web-ui-components](https://www.npmjs.com/package/react-native-web-ui-components), so first make sure you have installed `react-native-web-ui-components` and its dependencies. All inputs and buttons will follow the theme used on your project.

2) To install the stable version:

```sh
yarn add react-native-web-jsonschema-form
```

and to use it in your code:

```js
import Form from 'react-native-web-jsonschema-form'

const schema = {
  type: 'object',
  properties: {...}
};

const MyCustomForm = props => (
  <Form
  	{...props}
  	schema={schema}
  />
);
```

## Theme

You can select the theme of your form using [react-native-web-ui-components](https://www.npmjs.com/package/react-native-web-ui-components)'s UIProvider:

```js
import React from 'react';
import { StyleSheet } from 'react=native';
import { UIProvider, Router, Switch } from 'react-native-web-ui-components';
import { createNativeHistory } from 'history';

const history = createNativeHistory();

const theme = {
  input: {
    focused: StyleSheet.create({
      border: {
        borderColor: 'yellow',
      },
    }),
  },
};

const App = props => (
  <Router history={history}>
    <Switch history={history}>
      <UIProvider theme={theme}>
        <EntryScreen {...props} />
      </UIProvider>
    </Switch>
  </Router>
);
```

There are 5 input states: `regular`, `focused`, `disabled`, `readonly` and `error`. On which one of them you can define styles for `background`, `border`, `text`, `placeholder`, `opacity`, `selected` and `unselected`. These properties will be used accordingly by the widgets provided in this library. For example, `selected` and `unselected` will be used checkboxes and radioboxes to represent checked and unchecked.

### Usage

The `Form` has the following props:

```js
import React from 'react';
import Form from 'react-native-web-jsonschema-form';

const Example = ({
  // Misc
  name, // String to be used as id, if empty a hash will be used instead.
  onRef, // Function to be called with the form instance. This is NOT a DOM/Native element.
  scroller, // If provided, this will be passed to the widgets to allow disabling ScrollView during a gesture.
  wigdets, // Object with a list of custom widgets.

  
  // Data
  formData, // Initial data to populate the form. If this attribute changes, the form will update the data.
  filterEmptyValues, // If true, all empty and non-required fields will be omitted from the submitted values.

  // Schema
  schema, // JSON schema
  uiSchema, // JSON schema modifying UI defaults for schema
  errorSchema, // JSON schema with errors
  
  // Events
  // * All events can be synchronous or asynchronous functions.
  // * All events receive one parameter `event` with `name`, `preventDefault()` and `params`.
  onFocus,
  onChange,
  onSubmit,
  onCancel,
  onSuccess,
  onError,

  // Layout
  buttonPosition, // left, right, center
  submitButton, // If false, it will not be rendered. If it is a string, it will be used as the default button text.
  cancelButton, // If false, it will not be rendered. If it is a string, it will be used as the default button text.
  SubmitButton, // Component to render the submit button
  CancelButton, // Component to render the cancel button
}) => (
  <Form {...}/>
)
```

Basic Example:

```js
import React from 'React';
import PropTypes from 'prop-types';
import { Loading, Alert } from 'react-native-web-ui-components';
import Form from 'react-native-web-jsonschema-form';

class MyForm extends React.Component {
  static propTypes = {
    controller: PropTypes.string.isRequired,
    action: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      schema: null,
      message: null,
      posting: null,
    };
  }

  onSubmit = async (event) => {
    const { action, controller } = this.props;
    const { values } = event.params;
    this.setState({ posting: true });
    return fetch(`/${controller}/${action}`, {
      method: 'POST',
      body: JSON.stringify(values),
    });
  };

  onSuccess = async (event) => {
    const { response } = event.params;
    this.setState({
      posting: false,
      message: response.message,
    });
  };

  onError = async (event) => {
    // These are errors for fields that are not included in the schema
    const { exceptions } = event.params;
    const warning = Object.keys(exceptions).map(k => exceptions[k].join('\n'));
    this.setState({
      posting: false,
      message: warning.length ? warning.join('\n') : null,
    });
  };

  render() {
    const { schema, posting, message } = this.state;
    if (!schema) {
      const self = this;
      fetch(`/get-schema/${controller}/${action}`)
        .then((schema) => self.setState({ schema });

      return <Loading />;
    }

    return (
      <React.Fragment>
        {posting ? <Loading /> : null}
        {message ? (
          <Alert>
            Message
          </Alert>
        ) : null}
        <Form
          schema={schema}
          onSubmit={this.onSubmit}
          onSuccess={this.onSuccess}
          onError={this.onError}
        />
      </React.Fragment>
    );
  }
}
```