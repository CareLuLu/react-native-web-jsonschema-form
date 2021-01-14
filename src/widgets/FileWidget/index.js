import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import {
  get,
  each,
  last,
  cloneDeep,
} from 'lodash';
import StylePropType from 'react-native-web-ui-components/StylePropType';
import Dropzone from 'react-native-web-ui-components/Dropzone';
import Row from 'react-native-web-ui-components/Row';
import View from 'react-native-web-ui-components/View';
import {
  withPrefix,
  getTitle,
  getTitleFormat,
  isField,
  toPath,
} from '../../utils';
import ArrayWidget from '../ArrayWidget';
import ObjectWidget from '../ObjectWidget';
import TextWidget from '../TextWidget';
import FileArea from './FileArea';
import OrderHandle from './OrderHandle';
import RemoveHandle from './RemoveHandle';
import ProgressHandle from './ProgressHandle';
import UploadHandle from './UploadHandle';

let id = 0;

const handleRegex = /__handle( |$)/;

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
    paddingTop: 5,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 0,
  },
  main: {
    flex: 1,
  },
  item: {
    marginTop: -10,
    marginBottom: 0,
  },
  itemSingle: {
    height: 30,
  },
  label: {
    paddingTop: 10,
    paddingBottom: 5,
  },
  wrapper: {
    flex: 1,
  },
  singleLine: {
    minHeight: 40,
  },
  uploadSingle: {
    paddingLeft: 5,
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

const getProps = (props) => {
  const {
    name,
    value,
    schema,
    uiSchema,
    multiple,
    widgets,
    fileStyle,
    nameAttribute,
    pathAttribute,
    downloadable,
    downloadBasepath,
    EditComponent,
    ProgressComponent,
    UploadComponent,
    uploadLabel,
    uploadStyle,
  } = props;

  const dropzoneStyle = [];
  let isMultiple = multiple;
  let adjustedNameAttribute;
  let adjustedPathAttribute;
  let fileSchema = schema;
  let defaultWidget = 'text';
  let baseUiSchemaPath = '';
  let pathUiSchemaPath = '';
  let nameUiSchemaPath = '';
  let adjustedFileStyle = fileStyle;
  let adjustedDownloadable = downloadable;
  let adjustedDownloadBasepath = downloadBasepath;
  let adjustedEditComponent = EditComponent;
  let adjustedProgressComponent = ProgressComponent;
  let adjustedUploadComponent = UploadComponent;
  let adjustedUploadStyle = uploadStyle;
  let adjustedUploadLabel = uploadLabel;

  if (schema.type === 'array') {
    isMultiple = isMultiple === null ? true : isMultiple;
    fileSchema = schema.items;
    baseUiSchemaPath = 'items';
    pathUiSchemaPath = 'items';
    nameUiSchemaPath = 'items';
    adjustedUploadComponent = (
      adjustedUploadComponent
      || (uiSchema['ui:options'] && uiSchema['ui:options'].UploadComponent)
    );
    adjustedUploadStyle = (
      adjustedUploadStyle
      || (uiSchema['ui:options'] && uiSchema['ui:options'].uploadStyle)
    );
    adjustedUploadLabel = (
      adjustedUploadLabel
      || (uiSchema['ui:options'] && uiSchema['ui:options'].uploadLabel)
    );
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
  if (!adjustedUploadComponent) {
    adjustedUploadComponent = UploadHandle;
  }
  if (adjustedUploadStyle === undefined) {
    adjustedUploadStyle = null;
  }
  if (adjustedUploadLabel === undefined) {
    adjustedUploadLabel = 'Upload';
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
  if (schema.type === 'array') {
    if (uiSchema['ui:title'] !== false) {
      title = getTitle(getTitleFormat(schema, uiSchema), {
        name,
        value,
        key: last(name.split('.')),
      });
    }
    propertyUiSchema['ui:title'] = false;
    propertyUiSchema['ui:options'] = propertyUiSchema['ui:options'] || {};
    propertyUiSchema['ui:options'].addable = false;
    propertyUiSchema['ui:options'].minimumNumberOfItems = 0;
    propertyUiSchema['ui:options'].OrderComponent = propertyUiSchema['ui:options'].OrderComponent || OrderHandle;
    propertyUiSchema['ui:options'].RemoveComponent = propertyUiSchema['ui:options'].RemoveComponent || RemoveHandle;
    propertyUiSchema['ui:titleProps'] = propertyUiSchema['ui:titleProps'] || {};
    propertyUiSchema['ui:titleProps'].style = [
      styles.label,
      propertyUiSchema['ui:titleProps'].style,
    ];
    adjustedFileStyle = propertyUiSchema['ui:options'].fileStyle || fileStyle;
  }

  return {
    ...props,
    title,
    fileSchema,
    dropzoneStyle,
    propertyUiSchema,
    propertySchema: schema,
    multiple: isMultiple,
    LabelWidget: widgets.LabelWidget,
    fileStyle: adjustedFileStyle,
    UploadComponent: adjustedUploadComponent,
    uploadLabel: adjustedUploadLabel,
    uploadStyle: adjustedUploadStyle,
  };
};

const useOnChange = ({
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

const useOnAccepted = ({
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

const setMeta = (meta, params) => {
  each(params, (v, k) => { meta[`ui:${k}`] = v; }); // eslint-disable-line
};

const useOnMeta = ({
  name,
  meta,
  metas,
  value,
  values,
  schema,
  fileSchema,
  onChange,
  nameAttribute,
}) => {
  const anchor = useRef();

  anchor.current = (fileId, params) => {
    let update;
    let metaItem;
    let metaItemIndex;
    const nextMeta = get(metas, toPath(name), meta);
    const nextValue = get(values, toPath(name), value);

    if (schema.type === 'array' && fileSchema.type === 'string') {
      for (let i = 0; i < nextMeta.length; i += 1) {
        if (nextMeta[i]['ui:fileId'] === fileId) {
          metaItem = nextMeta[i];
          metaItemIndex = i;
        }
      }
      if (metaItem) {
        setMeta(metaItem, params);
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
        setMeta(metaItem[nameAttribute], params);
        update = [`${name}.${metaItemIndex}.${nameAttribute}`];
      }
    } else if (fileSchema.type === 'string' && nextMeta['ui:fileId'] === fileId) {
      setMeta(nextMeta, params);
      update = [name];
    } else if (fileSchema.type === 'object' && nextMeta[nameAttribute] && nextMeta[nameAttribute]['ui:fileId'] === fileId) {
      setMeta(nextMeta[nameAttribute], params);
      update = [`${name}.${nameAttribute}`];
    }
    if (update) {
      onChange(nextValue, name, {
        nextMeta,
        update,
      });
    }
  };

  return anchor;
};

const useOnDrop = (props) => {
  const {
    onDrop,
    onMeta,
    onAccepted,
    fileSchema,
    nameAttribute,
    pathAttribute,
  } = props;

  const anchor = useRef();
  anchor.current = (files) => {
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
          setData: data => onMeta.current(fileId, { data }),
          setProgress: progress => onMeta.current(fileId, { progress }),
          setError: error => onMeta.current(fileId, { error }),
        };
      });
      onDrop(nextFiles, onAccepted, props);
    }
  };
  return anchor;
};

const useOnAreaClick = ({ dragging }) => (event) => {
  if (dragging || event.isDefaultPrevented()) {
    event.stopPropagation();
  }
};

const useOnClick = ({ propertySchema }) => (event) => {
  const fn = propertySchema.type === 'array' ? 'preventDefault' : 'stopPropagation';
  if (
    event.nativeEvent.target.tagName === 'INPUT'
    || event.nativeEvent.target.querySelectorAll('input').length > 0
  ) {
    event[fn]();
  }
  if (isField(event.nativeEvent.target, handleRegex)) {
    event[fn]();
  }
  if (event.nativeEvent.target.tagName === 'A') {
    event.stopPropagation();
  }
};

const FileWidget = (props) => {
  const [dragging, setDragging] = useState(null);
  const params = getProps({ ...props, dragging, setDragging });

  const {
    title,
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
    style: _style,
    fileStyle,
    auto,
    dropzoneStyle,
    UploadComponent,
    uploadStyle,
    uploadLabel,
    ...nextProps
  } = params;

  const onAreaClick = useOnAreaClick(params);
  const onClick = useOnClick(params);
  const onChange = useOnChange(params);
  const onMeta = useOnMeta(params);
  const onAccepted = useOnAccepted({ ...params, onChange });

  const onDropAnchor = useOnDrop({ ...params, onMeta, onAccepted });
  const onDrop = useCallback(
    (...args) => onDropAnchor.current(...args),
    [onDropAnchor],
  );

  const dropzone = useRef();
  const onRef = (ref) => {
    dropzone.current = ref;
  };
  const onUploadPress = () => {
    if (dropzone.current) {
      dropzone.current.open();
    }
  };

  return (
    <React.Fragment>
      {(title !== false || uiSchema['ui:toggleable']) && propertySchema.type === 'string' ? (
        <LabelWidget
          {...nextProps}
          onChange={onChange}
          toggleable={!!uiSchema['ui:toggleable']}
          hasTitle={title !== false}
          hasError={hasError}
          auto={propertyUiSchema['ui:inline']}
          {...propertyUiSchema['ui:titleProps']}
        >
          {title}
        </LabelWidget>
      ) : null}
      <Dropzone
        onRef={onRef}
        onDrop={onDrop}
        accept={accept}
        disabled={!!uiSchema['ui:disabled']}
        cameraText={cameraText}
        albumText={albumText}
        fileText={fileText}
        cancelText={cancelText}
        style={[
          styles.defaults,
          auto ? styles.auto : styles.fullWidth,
          dropzoneStyle,
          _style,
        ]}
      >
        <Row>
          {propertySchema.type === 'array' ? (
            <FileArea onAreaClick={onAreaClick} style={styles.containerMultiple}>
              <UploadComponent
                {...props}
                auto={false}
                uploadStyle={uploadStyle}
                uploadLabel={uploadLabel}
                onUploadPress={onUploadPress}
              />
              <ArrayWidget
                {...nextProps}
                auto={false}
                hasError={hasError}
                schema={propertySchema}
                uiSchema={propertyUiSchema}
                style={[styles.item, fileStyle]}
                onClick={onClick}
                onChange={onChange}
              />
            </FileArea>
          ) : (
            <>
              <View style={styles.wrapper}>
                {propertySchema.type === 'object' ? (
                  <FileArea onAreaClick={onClick} style={styles.containerSingle}>
                    <ObjectWidget
                      {...nextProps}
                      auto={false}
                      hasError={hasError}
                      schema={propertySchema}
                      uiSchema={propertyUiSchema}
                      style={[styles.item, styles.itemSingle, fileStyle]}
                      onChange={onChange}
                    />
                  </FileArea>
                ) : null}
                {propertySchema.type === 'string' && nextProps.value ? (
                  <FileArea onAreaClick={onClick} style={styles.containerSingle}>
                    <TextWidget
                      {...nextProps}
                      {...propertyUiSchema['ui:widgetProps']}
                      auto={false}
                      hasError={hasError}
                      schema={propertySchema}
                      uiSchema={propertyUiSchema}
                      style={[styles.item, styles.itemSingle, fileStyle]}
                      onChange={onChange}
                    />
                  </FileArea>
                ) : null}
              </View>
              <UploadComponent
                {...props}
                auto
                uploadStyle={[styles.uploadSingle, uploadStyle]}
                uploadLabel={uploadLabel}
                onUploadPress={onUploadPress}
              />
            </>
          )}
        </Row>
      </Dropzone>
    </React.Fragment>
  );
};

FileWidget.propTypes = {
  name: PropTypes.string.isRequired,
  schema: PropTypes.shape().isRequired,
  uiSchema: PropTypes.shape().isRequired,
  hasError: PropTypes.bool.isRequired,
  widgets: PropTypes.shape().isRequired,
  style: StylePropType,
  fileStyle: StylePropType,
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
  fileStyle: null,
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
