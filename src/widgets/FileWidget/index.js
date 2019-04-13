import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform } from 'react-native';
import {
  get,
  each,
  last,
  cloneDeep,
} from 'lodash';
import {
  withState,
  withProps,
  withHandlers,
  compose,
} from 'recompact';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import Dropzone from 'react-native-web-ui-components/Dropzone';
import View from 'react-native-web-ui-components/View';
import Row from 'react-native-web-ui-components/Row';
import { withPrefix, getTitle, FIELD_TITLE } from '../../utils';
import ArrayWidget from '../ArrayWidget';
import ObjectWidget from '../ObjectWidget';
import TextWidget from '../TextWidget';
import OrderHandle from './OrderHandle';
import RemoveHandle from './RemoveHandle';
import ProgressHandle from './ProgressHandle';

let id = 0;

const styles = StyleSheet.create({
  defaults: {
    marginBottom: 10,
  },
  fullWidth: {
    width: '100%',
  },
  auto: {
    marginBottom: 0,
  },
  containerMultiple: {
    width: '100%',
    padding: 10,
  },
  containerSingle: {
    width: '100%',
    padding: 5,
  },
  singleLine: {
    minHeight: 0,
    height: 40,
  },
  main: {
    flex: 1,
  },
  item: {
    marginTop: -10,
  },
  label: {
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 5,
  },
});

const uiProperty = /^ui:/;
const attribute = /\.[^.]+$/;

const getHref = ({
  name,
  meta,
  values,
  basepath,
  pathAttribute,
}) => {
  const progress = meta && meta['ui:progress'];
  if (progress === undefined || progress === 100) {
    let path = name;
    if (pathAttribute) {
      path = name.replace(attribute, `.${pathAttribute}`);
    }
    return `${basepath}${get(values, path)}`;
  }
  return null;
};

const getProps = ({
  name,
  value,
  schema,
  uiSchema,
  multiple,
  widgets,
  nameAttribute,
  pathAttribute,
  downloadable,
  downloadBasepath,
  EditComponent,
  ProgressComponent,
}) => {
  const dropzoneStyle = [];
  let isMultiple = multiple;
  let adjustedNameAttribute;
  let adjustedPathAttribute;
  let fileSchema = schema;
  let defaultWidget = 'text';
  let baseUiSchemaPath = '';
  let pathUiSchemaPath = '';
  let nameUiSchemaPath = '';
  let adjustedDownloadable = downloadable;
  let adjustedDownloadBasepath = downloadBasepath;
  let adjustedEditComponent = EditComponent;
  let adjustedProgressComponent = ProgressComponent;

  if (schema.type === 'array') {
    isMultiple = isMultiple === null ? true : isMultiple;
    fileSchema = schema.items;
    baseUiSchemaPath = 'items';
    pathUiSchemaPath = 'items';
    nameUiSchemaPath = 'items';
    adjustedEditComponent = (
      adjustedEditComponent
      || (uiSchema['ui:options'] && uiSchema['ui:options'].EditComponent)
    );
    adjustedProgressComponent = (
      adjustedProgressComponent
      || (uiSchema['ui:options'] && uiSchema['ui:options'].ProgressComponent)
    );
    if (adjustedDownloadable === undefined) {
      adjustedDownloadable = uiSchema['ui:options'] && uiSchema['ui:options'].downloadable;
    }
    if (adjustedDownloadBasepath === undefined) {
      adjustedDownloadBasepath = uiSchema['ui:options'] && uiSchema['ui:options'].downloadBasepath;
    }
  } else if (isMultiple) {
    throw new Error('FileWidget: widget cannot return multiple files for a non-array schema.');
  } else {
    isMultiple = false;
  }

  if (!adjustedProgressComponent) {
    adjustedProgressComponent = ProgressHandle;
  }
  if (adjustedDownloadable === undefined) {
    adjustedDownloadable = true;
  }
  if (adjustedDownloadBasepath === undefined) {
    adjustedDownloadBasepath = '';
  }

  if (fileSchema.type === 'string') {
    adjustedNameAttribute = '';
    adjustedPathAttribute = '';
  } else if (fileSchema.type === 'object') {
    const strings = Object.keys(fileSchema.properties).filter(k => (fileSchema.properties[k].type === 'string'));

    if (!strings.length) {
      throw new Error('FileWidget: the file schema must have at least one string property to be used as pathAttribute.');
    }
    adjustedPathAttribute = pathAttribute || strings[0];
    adjustedNameAttribute = nameAttribute || adjustedPathAttribute;

    if (strings.indexOf(adjustedPathAttribute) < 0) {
      throw new Error(`FileWidget: the file schema doesn't contain "${adjustedPathAttribute}"`);
    }
    if (strings.indexOf(adjustedNameAttribute) < 0) {
      throw new Error(`FileWidget: the file schema doesn't contain "${adjustedNameAttribute}"`);
    }
    nameUiSchemaPath = withPrefix(adjustedNameAttribute, nameUiSchemaPath);
    pathUiSchemaPath = withPrefix(adjustedPathAttribute, pathUiSchemaPath);
  } else {
    throw new Error(`FileWidget cannot be used with ${fileSchema.type}.`);
  }

  const propertyUiSchema = cloneDeep(uiSchema);
  const baseUiSchema = baseUiSchemaPath
    ? get(propertyUiSchema, baseUiSchemaPath) : propertyUiSchema;
  const pathUiSchema = pathUiSchemaPath
    ? get(propertyUiSchema, pathUiSchemaPath) : propertyUiSchema;
  const nameUiSchema = nameUiSchemaPath
    ? get(propertyUiSchema, nameUiSchemaPath) : propertyUiSchema;

  if (adjustedNameAttribute && adjustedNameAttribute !== adjustedPathAttribute) {
    baseUiSchema['ui:title'] = false;
    pathUiSchema['ui:widget'] = 'hidden';
    if (schema.type !== 'array' && (!value || !value[pathAttribute])) {
      defaultWidget = 'hidden';
    }
    nameUiSchema['ui:widget'] = nameUiSchema['ui:widget'] || defaultWidget;
    nameUiSchema['ui:title'] = false;
    nameUiSchema['ui:widgetProps'] = nameUiSchema['ui:widgetProps'] || {};
    nameUiSchema['ui:widgetProps'].auto = false;
    nameUiSchema['ui:widgetProps'].editable = true;
    nameUiSchema['ui:widgetProps'].style = [
      styles.auto,
      styles.fullWidth,
      nameUiSchema['ui:widgetProps'].style,
    ];
    if (adjustedDownloadable) {
      nameUiSchema['ui:widgetProps'].basepath = adjustedDownloadBasepath;
      nameUiSchema['ui:widgetProps'].to = getHref;
      nameUiSchema['ui:widgetProps'].pathAttribute = pathAttribute;
    }
    nameUiSchema['ui:widgetProps'].inputContainerStyle = styles.main;
    nameUiSchema['ui:widgetProps'].EditComponent = adjustedEditComponent;
    nameUiSchema['ui:widgetProps'].children = adjustedProgressComponent;
    if (schema.type !== 'array' && (nameUiSchema['ui:widget'] === 'text' || nameUiSchema['ui:widget'] === 'hidden')) {
      dropzoneStyle.push(styles.singleLine);
    }
  } else {
    if (
      (schema.type === 'string' && !value)
      || (schema.type === 'object' && (!value || !value[pathAttribute]))
    ) {
      defaultWidget = 'hidden';
    }
    pathUiSchema['ui:widget'] = pathUiSchema['ui:widget'] || defaultWidget;
    pathUiSchema['ui:title'] = false;
    pathUiSchema['ui:widgetProps'] = pathUiSchema['ui:widgetProps'] || {};
    pathUiSchema['ui:widgetProps'].auto = false;
    pathUiSchema['ui:widgetProps'].editable = false;
    pathUiSchema['ui:widgetProps'].style = [
      styles.auto,
      styles.fullWidth,
      pathUiSchema['ui:widgetProps'].style,
    ];
    if (adjustedDownloadable) {
      pathUiSchema['ui:widgetProps'].basepath = adjustedDownloadBasepath;
      pathUiSchema['ui:widgetProps'].to = getHref;
    }
    pathUiSchema['ui:widgetProps'].EditComponent = adjustedEditComponent;
    pathUiSchema['ui:widgetProps'].children = adjustedProgressComponent;
    if (
      (schema.type === 'string' && pathUiSchema['ui:widget'] === 'file')
      || (schema.type === 'object' && pathUiSchema['ui:widget'] === 'text')
    ) {
      dropzoneStyle.push(styles.singleLine);
    }
  }

  if (fileSchema.type === 'object') {
    baseUiSchema['ui:grid'] = [{
      type: 'view',
      style: styles.main,
      children: [],
    }];
    each(baseUiSchema, (innerPropertyUiSchema, k) => {
      if (!uiProperty.test(k)) {
        baseUiSchema['ui:grid'][0].children.push(k);
        if (k !== adjustedNameAttribute && k !== adjustedPathAttribute) {
          innerPropertyUiSchema['ui:widget'] = 'hidden'; // eslint-disable-line
        }
      }
    });
  }

  let title = false;
  if (schema.type === 'array' && uiSchema['ui:title'] !== false) {
    title = getTitle(uiSchema['ui:title'] || FIELD_TITLE, {
      name,
      value,
      key: last(name.split('.')),
    });
    propertyUiSchema['ui:title'] = false;
    propertyUiSchema['ui:options'] = propertyUiSchema['ui:options'] || {};
    propertyUiSchema['ui:options'].addable = false;
    propertyUiSchema['ui:options'].OrderComponent = propertyUiSchema['ui:options'].OrderComponent || OrderHandle;
    propertyUiSchema['ui:options'].RemoveComponent = propertyUiSchema['ui:options'].RemoveComponent || RemoveHandle;
    propertyUiSchema['ui:titleProps'] = propertyUiSchema['ui:titleProps'] || {};
    propertyUiSchema['ui:titleProps'].style = [
      styles.label,
      propertyUiSchema['ui:titleProps'].style,
    ];
  }

  return {
    title,
    fileSchema,
    dropzoneStyle,
    propertyUiSchema,
    propertySchema: schema,
    multiple: isMultiple,
    LabelWidget: widgets.LabelWidget,
  };
};

const onChangeHandler = ({
  name,
  value,
  onChange,
  schema,
  nameAttribute,
  pathAttribute,
}) => (propertyValue, propertyName, params = {}) => {
  if (schema.type === 'array' && propertyName === name) {
    const update = [];
    const length = Math.max(propertyValue.length, value.length);
    for (let i = 0; i < length; i += 1) {
      update.push(`${name}.${i}${nameAttribute ? `.${nameAttribute}` : ''}`);
      update.push(`${name}.${i}${pathAttribute ? `.${pathAttribute}` : ''}`);
    }
    onChange(propertyValue, propertyName, {
      ...params,
      update,
    });
  } else if (schema.type === 'array' && schema.items.type === 'object') {
    const path = propertyName.split('.');
    const [key] = path.splice(-1, 1);
    const index = parseInt(path.splice(-1, 1)[0], 10);
    value[index][key] = propertyValue; // eslint-disable-line
    onChange(value, name, {
      ...params,
      update: [
        `${name}.${index}.${nameAttribute}`,
        `${name}.${index}.${pathAttribute}`,
      ],
    });
  } else if (schema.type === 'array' && schema.items.type === 'string') {
    const path = propertyName.split('.');
    const index = parseInt(path.splice(-1, 1)[0], 10);
    value[index] = propertyValue; // eslint-disable-line
    onChange(value, name, {
      ...params,
      update: [`${name}.${index}`],
    });
  } else if (schema.type === 'object' && propertyName === name) {
    onChange(propertyValue, propertyName, {
      ...params,
      update: [
        `${name}.${nameAttribute}`,
        `${name}.${pathAttribute}`,
      ],
    });
  } else if (schema.type === 'object') {
    const path = propertyName.split('.');
    const [key] = path.splice(-1, 1);
    value[key] = propertyValue; // eslint-disable-line
    onChange(value, name, {
      ...params,
      update: [
        `${name}.${nameAttribute}`,
        `${name}.${pathAttribute}`,
      ],
    });
  } else {
    onChange(propertyValue, propertyName, params);
  }
};

const onAcceptedHanlder = ({
  name,
  meta,
  value,
  schema,
  multiple,
  onChange,
  fileSchema,
  nameAttribute,
}) => (files) => {
  let nextValue = files;
  let nextMeta = meta;
  if (multiple) {
    nextValue = value.concat(files.map(file => file.value));
    if (fileSchema.type === 'string') {
      nextMeta = nextMeta.concat(files.map(file => ({
        'ui:fileId': file.id,
        'ui:progress': 0,
      })));
    } else {
      nextMeta = nextMeta.concat(files.map(file => ({
        [nameAttribute]: {
          'ui:fileId': file.id,
          'ui:progress': 0,
        },
      })));
    }
    return onChange(nextValue, name, {
      nextMeta,
    });
  }
  if (schema.type === 'array' && fileSchema === 'string') {
    nextValue = files.map(file => file.value);
    nextMeta = files.map(file => ({
      'ui:fileId': file.id,
      'ui:progress': 0,
    }));
  } else if (schema.type === 'array' && fileSchema === 'object') {
    nextValue = files.map(file => file.value);
    nextMeta = files.map(file => ({
      [nameAttribute]: {
        'ui:fileId': file.id,
        'ui:progress': 0,
      },
    }));
  } else if (schema.type === 'object') {
    nextValue = {};
    nextMeta = {};
    if (files.length) {
      Object.assign(nextValue, files[0].value);
      Object.assign(nextMeta, {
        [nameAttribute]: {
          'ui:fileId': files[0].id,
          'ui:progress': 0,
        },
      });
    }
  } else {
    nextValue = null;
    nextMeta = {};
    if (files.length) {
      nextValue = files[0].value;
      Object.assign(nextMeta, {
        'ui:fileId': files[0].id,
        'ui:progress': 0,
      });
    }
  }
  return onChange(nextValue, name, {
    nextMeta,
  });
};

const onProgressHandler = ({
  name,
  meta,
  value,
  schema,
  fileSchema,
  nameAttribute,
  originalOnChange,
}) => (fileId, progress) => {
  let update;
  let metaItem;
  let metaItemIndex;
  const nextMeta = meta;
  if (schema.type === 'array' && fileSchema.type === 'string') {
    for (let i = 0; i < nextMeta.length; i += 1) {
      if (nextMeta[i]['ui:fileId'] === fileId) {
        metaItem = nextMeta[i];
        metaItemIndex = i;
      }
    }
    if (metaItem) {
      metaItem['ui:progress'] = progress;
      update = [`${name}.${metaItemIndex}`];
    }
  } else if (schema.type === 'array' && fileSchema.type === 'object') {
    for (let i = 0; i < nextMeta.length; i += 1) {
      if (nextMeta[i][nameAttribute] && nextMeta[i][nameAttribute]['ui:fileId'] === fileId) {
        metaItem = nextMeta[i];
        metaItemIndex = i;
      }
    }
    if (metaItem) {
      metaItem[nameAttribute]['ui:progress'] = progress;
      update = [`${name}.${metaItemIndex}.${nameAttribute}`];
    }
  } else if (fileSchema.type === 'string' && nextMeta['ui:fileId'] === fileId) {
    nextMeta['ui:progress'] = progress;
    update = [name];
  } else if (fileSchema.type === 'object' && nextMeta[nameAttribute] && nextMeta[nameAttribute]['ui:fileId'] === fileId) {
    nextMeta[nameAttribute]['ui:progress'] = progress;
    update = [`${name}.${nameAttribute}`];
  }
  if (update) {
    originalOnChange(value, name, {
      nextMeta,
      update,
    });
  }
};

const onDropHandler = ({
  onDrop,
  onAccepted,
  onProgress,
  fileSchema,
  nameAttribute,
  pathAttribute,
}) => (files) => {
  if (files.length) {
    const nextFiles = files.map((file) => {
      id += 1;
      const fileId = id;
      return {
        id,
        file,
        value: fileSchema.type === 'string' ? (file.uri || file.name) : ({
          [nameAttribute]: file.name,
          [pathAttribute]: file.uri || file.name,
        }),
        setProgress: progress => onProgress(fileId, progress),
      };
    });
    onDrop(nextFiles, onAccepted);
  }
};

const Wrapper = ({ onAreaClick, style, children }) => {
  if (Platform.OS === 'web') {
    return React.createElement('div', {
      style: StyleSheet.flatten(style),
      onClick: onAreaClick,
    }, children);
  }
  return (
    <View style={style}>
      {children}
    </View>
  );
};

Wrapper.propTypes = {
  onAreaClick: PropTypes.func.isRequired,
  children: PropTypes.node,
  style: StylePropType,
};

Wrapper.defaultProps = {
  children: null,
  style: null,
};

const FileWidget = compose(
  withState('dragging', 'setDragging', null),
  withProps(getProps),
  withHandlers({
    onAreaClick: ({ dragging }) => event => (dragging && event.preventDefault()),
    onClick: () => event => event.preventDefault(),
    onChange: onChangeHandler,
    originalOnChange: ({ onChange }) => (...args) => onChange(...args),
  }),
  withHandlers({
    onAccepted: onAcceptedHanlder,
    onProgress: onProgressHandler,
  }),
  withHandlers({
    onDrop: onDropHandler,
  }),
)(({
  title,
  onDrop,
  accept,
  cameraText,
  albumText,
  fileText,
  cancelText,
  propertySchema,
  propertyUiSchema,
  uiSchema,
  LabelWidget,
  hasError,
  style,
  auto,
  onClick,
  onAreaClick,
  dropzoneStyle,
  ...props
}) => (
  <React.Fragment>
    {title !== false ? (
      <LabelWidget hasError={hasError} auto={propertyUiSchema['ui:inline']} {...propertyUiSchema['ui:titleProps']}>
        {title}
      </LabelWidget>
    ) : null}
    <Dropzone
      onDrop={onDrop}
      accept={accept}
      cameraText={cameraText}
      albumText={albumText}
      fileText={fileText}
      cancelText={cancelText}
      style={[
        styles.defaults,
        auto ? styles.auto : styles.fullWidth,
        dropzoneStyle,
        style,
      ]}
    >
      <Row>
        {propertySchema.type === 'array' ? (
          <Wrapper onAreaClick={onAreaClick} style={styles.containerMultiple}>
            <ArrayWidget
              {...props}
              auto={false}
              hasError={hasError}
              schema={propertySchema}
              uiSchema={propertyUiSchema}
              style={styles.item}
              onClick={onClick}
            />
          </Wrapper>
        ) : null}
        {propertySchema.type === 'object' ? (
          <Wrapper onAreaClick={onClick} style={styles.containerSingle}>
            <ObjectWidget
              {...props}
              auto={false}
              hasError={hasError}
              schema={propertySchema}
              uiSchema={propertyUiSchema}
              style={styles.item}
            />
          </Wrapper>
        ) : null}
        {propertySchema.type === 'string' && props.value ? (
          <Wrapper onAreaClick={onClick} style={styles.containerSingle}>
            <TextWidget
              {...props}
              {...propertyUiSchema['ui:widgetProps']}
              auto={false}
              hasError={hasError}
              schema={propertySchema}
              uiSchema={propertyUiSchema}
              style={styles.item}
            />
          </Wrapper>
        ) : null}
      </Row>
    </Dropzone>
  </React.Fragment>
));

FileWidget.propTypes = {
  name: PropTypes.string.isRequired,
  schema: PropTypes.shape().isRequired,
  uiSchema: PropTypes.shape().isRequired,
  hasError: PropTypes.bool.isRequired,
  widgets: PropTypes.shape().isRequired,
  style: StylePropType,
  auto: PropTypes.bool,
  multiple: PropTypes.bool,
  nameAttribute: PropTypes.string,
  pathAttribute: PropTypes.string,
  onDrop: PropTypes.func,
  accept: PropTypes.arrayOf(PropTypes.string),
  cameraText: PropTypes.string,
  albumText: PropTypes.string,
  fileText: PropTypes.string,
  cancelText: PropTypes.string,
  EditComponent: PropTypes.elementType,
  ProgressComponent: PropTypes.elementType,
  downloadable: PropTypes.bool,
  downloadBasepath: PropTypes.string,
};

FileWidget.defaultProps = {
  style: null,
  auto: false,
  multiple: null,
  nameAttribute: null,
  pathAttribute: null,
  onDrop: (items, accept) => accept(items),
  accept: undefined,
  cameraText: undefined,
  albumText: undefined,
  fileText: undefined,
  cancelText: undefined,
  EditComponent: undefined,
  ProgressComponent: undefined,
  downloadable: undefined,
  downloadBasepath: undefined,
};

export default FileWidget;
