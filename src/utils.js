import { useState } from 'react';
import {
  has,
  get,
  each,
  uniq,
  first,
  indexOf,
  flatten,
  isNaN,
  isArray,
  isString,
  isPlainObject,
} from 'lodash';
import { humanize } from 'underscore.string';

export const EMPTY = '%empty%';
export const FIELD_KEY = '%key%';
export const FIELD_NAME = '%name%';
export const FIELD_VALUE = '%value%';
export const FIELD_TITLE = '%title%';

const FIELD_KEY_REGEX = /%key%/g;
const FIELD_NAME_REGEX = /%name%/g;
const FIELD_VALUE_REGEX = /%value%/g;
const FIELD_TITLE_REGEX = /%title%/g;

/* eslint no-param-reassign: 0 */

const passThrough = () => value => value;

const withDefaults = (uiSchema, base = {}) => ({
  '*': base['*'] || uiSchema['*'] || {}, // Pass default through
  ...(base['*'] || uiSchema['*'] || {}), // Inherit default properties
  ...(uiSchema || {}),
});

const getGridStructure = (grid, schema, uiSchema, getStructure) => {
  if (grid.type === 'label') {
    return {};
  }
  const compiledSchema = {};
  const compiledUiSchema = {};
  each(grid.children, (item) => {
    if (isString(item)) {
      getStructure(
        schema.properties[item],
        withDefaults(uiSchema[item], uiSchema),
        item,
        compiledSchema,
        compiledUiSchema,
      );
    } else {
      const gridStructure = getGridStructure(item, schema, uiSchema, getStructure);
      Object.assign(compiledSchema, gridStructure.schema);
      Object.assign(compiledUiSchema, gridStructure.uiSchema);
    }
  });
  return {
    schema: compiledSchema,
    uiSchema: compiledUiSchema,
  };
};

const isValid = (key, pick, omitted, include) => (
  (include.length && include.indexOf(key) >= 0) || (
    (!pick.length || pick.indexOf(key) >= 0)
    && (!omitted.length || omitted.indexOf(key) < 0)
  )
);

const getUiSchemaPick = (schema, uiSchema) => {
  let pick = uiSchema['ui:pick'] || [];
  if (pick === 'required') {
    pick = schema.required;
  } else if (pick) {
    const requiredIndex = indexOf(pick, '*required');
    if (requiredIndex >= 0) {
      pick = pick.concat([]);
      pick[requiredIndex] = schema.required;
      pick = uniq(flatten(pick));
    }
  }
  return pick;
};

const orderedKeys = (schema, uiSchema) => uniq((
  uiSchema['ui:order']
  || getUiSchemaPick(schema, uiSchema)
).concat(Object.keys(schema.properties)));

const orderedEach = (schema, uiSchema, iterator) => {
  const keys = orderedKeys(schema, uiSchema);
  each(keys, key => iterator(schema.properties[key], key));
};

export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const getAutoFocus = ({ uiSchema }) => !!uiSchema['ui:autofocus'];

export const useAutoFocus = ({ uiSchema, onFocus, onBlur }) => {
  const [autoFocus, setAutoFocus] = useState(getAutoFocus({ uiSchema }));

  return {
    autoFocus,
    onFocus: (...args) => {
      setAutoFocus(true);
      if (onFocus) {
        onFocus(...args);
      }
    },
    onBlur: (...args) => {
      setAutoFocus(false);
      if (onBlur) {
        onBlur(...args);
      }
    },
  };
};

export const useOnChange = (props) => {
  const {
    name,
    onChange,
    parser = passThrough,
  } = props;

  return value => onChange(parser(props)(value), name);
};

export const getStructure = (
  possibleSchema,
  uiSchema,
  key,
  compiledSchema = {},
  compiledUiSchema = {},
) => {
  if (!possibleSchema) {
    return {
      schema: compiledSchema,
      uiSchema: compiledUiSchema,
    };
  }
  let schema = possibleSchema;
  if (schema.anyOf) {
    schema = first(schema.anyOf);
  } else if (schema.oneOf) {
    schema = first(schema.oneOf);
  }
  if (schema.type === 'object') {
    const schemaNode = {
      ...schema,
      properties: {},
      required: schema.required || [],
    };
    const uiSchemaNode = withDefaults(uiSchema);
    if (uiSchemaNode['ui:grid']) {
      // Pull properties defined on/ordered by the grid
      each(uiSchema['ui:grid'], (grid) => {
        const gridStructure = getGridStructure(grid, schema, uiSchemaNode, getStructure);
        Object.assign(schemaNode.properties, gridStructure.schema);
        Object.assign(uiSchemaNode, gridStructure.uiSchema);
      });
    } else {
      // Pull valid properties in order of ui:order
      const pick = getUiSchemaPick(schema, uiSchema);
      const omitted = uiSchema['ui:omit'] || [];
      const include = uiSchema['ui:include'] || [];
      orderedEach(schema, uiSchema, (propertySchema, propertyKey) => {
        if (isValid(propertyKey, pick, omitted, include)) {
          getStructure(
            propertySchema,
            withDefaults(uiSchema[propertyKey], uiSchemaNode),
            propertyKey,
            schemaNode.properties,
            uiSchemaNode,
          );
        }
      });
    }
    if (key) {
      compiledSchema[key] = schemaNode;
      compiledUiSchema[key] = uiSchemaNode;
    } else {
      Object.assign(compiledSchema, schemaNode);
      Object.assign(compiledUiSchema, uiSchemaNode);
    }
  } else if (schema.type === 'array') {
    const schemaNode = {
      ...schema,
    };
    const uiSchemaNode = withDefaults(uiSchema);
    getStructure(
      schemaNode.items,
      withDefaults(uiSchemaNode.items, uiSchemaNode),
      'items',
      schemaNode,
      uiSchemaNode,
    );
    compiledSchema[key] = schemaNode;
    compiledUiSchema[key] = uiSchemaNode;
  } else {
    compiledSchema[key] = { ...schema };
    compiledUiSchema[key] = { ...uiSchema };
  }
  return {
    schema: compiledSchema,
    uiSchema: compiledUiSchema,
  };
};

export const isField = (element, classNameRegex) => {
  for (let node = element; node && node !== document; node = node.parentNode) {
    if (
      classNameRegex.test(node.className || '')
      || classNameRegex.test(node.getAttribute('data-class') || '')
    ) {
      return true;
    }
  }
  return false;
};

// Similar to lodash's merge but it doesn't merge arrays.
// Instead, arrays are replaced by source's array.
export const merge = (destination, source = {}) => {
  each(source, (v, k) => {
    if (!has(destination, k)) {
      destination[k] = v;
    } else if (isPlainObject(v)) {
      if (!isPlainObject(destination[k])) {
        destination[k] = v;
      } else {
        merge(destination[k], v);
      }
    } else {
      destination[k] = v;
    }
  });
  return destination;
};

export const getValues = (data, schema, key, casting = true, uiSchema = false) => {
  let value = key ? get(data, key) : data;
  if (schema.type === 'object') {
    value = isPlainObject(value) ? value : {};
    const node = {};
    each(schema.properties, (propertySchema, propertyKey) => {
      node[propertyKey] = getValues(
        value,
        propertySchema,
        propertyKey,
        casting,
        uiSchema && uiSchema[propertyKey],
      );
    });
    if (uiSchema) {
      value['ui:disabled'] = (uiSchema && uiSchema['ui:disabled']) || false;
    }
    return node;
  }
  if (schema.type === 'array') {
    value = isArray(value) ? value : [];
    if (uiSchema) {
      value['ui:disabled'] = (uiSchema && uiSchema['ui:disabled']) || false;
    }
    return value.map(item => getValues(
      item,
      schema.items,
      null,
      casting,
      uiSchema && uiSchema.items,
    ));
  }
  if (casting) {
    if (value === null || value === undefined) {
      switch (schema.type) {
        case 'string': value = schema.enum ? null : ''; break;
        case 'number':
        case 'float':
        case 'integer':
        case 'date':
        default: value = null;
      }
    } else {
      switch (schema.type) {
        case 'string': value = `${value}`; break;
        case 'number':
        case 'float': value = parseFloat(value); break;
        case 'integer':
        case 'date': value = parseInt(value, 10); break;
        default: break;
      }
      if (isNaN(value)) {
        value = null;
      }
    }
  } else if (uiSchema) {
    value = {
      'ui:disabled': (uiSchema && uiSchema['ui:disabled']) || false,
    };
  }
  return value;
};

export const getMetas = (data, schema, uiSchema) => getValues(data, schema, null, false, uiSchema);

export const getErrors = (data, schema, key) => getValues(data, schema, key, false);

export const withPrefix = (key, prefix) => (prefix ? `${prefix}.${key}` : key);

export const getExceptions = (errorSchema, errors, path = '') => {
  const exceptions = {};
  if (isArray(errorSchema) && errorSchema.length && isString(errorSchema[0]) && !errors) {
    exceptions[path] = errorSchema;
  } else if (isPlainObject(errorSchema) || isArray(errorSchema)) {
    each(errorSchema, (v, k) => Object.assign(
      exceptions,
      getExceptions(errorSchema[k], get(errors, k), withPrefix(k, path)),
    ));
  }
  return exceptions;
};

const nameToPath = /\.([0-9]+)\.?/g;

export const toPath = (name, replacement = '[$1]') => name.replace(nameToPath, replacement);

export const getTitle = (format, params = {}) => {
  let title = format || '';
  title = title.replace(FIELD_TITLE_REGEX, humanize(params.key || ''));
  title = title.replace(FIELD_KEY_REGEX, params.key);
  title = title.replace(FIELD_NAME_REGEX, params.name);
  title = title.replace(FIELD_VALUE_REGEX, params.value);
  return title;
};

export const ucfirst = (text) => {
  if (!text) {
    return '';
  }
  return `${text[0].toUpperCase()}${text.substring(1)}`;
};

export const getComponent = (name, suffix, library) => library[`${ucfirst(name)}${suffix}`];

export const expand = (update) => {
  if (update === 'all') {
    return update;
  }
  const parts = {};
  each(update, (name) => {
    const keys = name.split('.');
    let prefix = '';
    each(keys, (key) => {
      prefix = withPrefix(key, prefix);
      parts[prefix] = true;
    });
  });
  return parts;
};

export const getRequired = (schema, prefix = '') => {
  let required = {};
  if (schema.type === 'object') {
    each(schema.required || [], (propertyKey) => {
      required[withPrefix(propertyKey, prefix)] = true;
    });
    each(schema.properties, (propertySchema, propertyKey) => Object.assign(
      required,
      getRequired(propertySchema, withPrefix(propertyKey, prefix)),
    ));
  }
  if (schema.type === 'array') {
    Object.assign(required, getRequired(schema.items, withPrefix('0', prefix)));
  }
  if (prefix === '') {
    const normalizedRequired = {};
    each(required, (v, k) => {
      normalizedRequired[toPath(k, '[]')] = v;
    });
    required = normalizedRequired;
  }
  return required;
};

const maskOptions = {
  undefined: /^$/,
  a: /^[A-Za-zÀ-ÖØ-öø-ÿ]$/,
  9: /^[0-9]$/,
  '*': /^.$/,
};

export const formatMask = (value, mask) => {
  const text = (value === null || value === undefined) ? '' : `${value}`;
  let result = '';
  let cursorText = 0;
  let cursorMask = 0;
  for (; cursorText < text.length; cursorText += 1) {
    let charText = text[cursorText];
    let charMask;
    let extras = '';
    do {
      charMask = mask[cursorMask];
      cursorMask += 1;
      if (!(charMask in maskOptions)) {
        extras += charMask;
        if (charMask === charText) {
          cursorText += 1;
          charText = text[cursorText] || '';
          result += extras;
          extras = '';
        }
      }
    } while (!(charMask in maskOptions));
    if (maskOptions[charMask].test(charText)) {
      result += extras + charText;
    }
  }
  return result;
};

export const normalized = (value) => {
  if (value === '' || value === null || value === undefined) {
    return '';
  }
  return value;
};

export const isEmpty = value => (value === '' || value === null || value === undefined);

export const viewStyleKeys = [
  'animationDelay',
  'animationDirection',
  'animationDuration',
  'animationFillMode',
  'animationIterationCount',
  'animationName',
  'animationPlayState',
  'animationTimingFunction',
  'transitionDelay',
  'transitionDuration',
  'transitionProperty',
  'transitionTimingFunction',
  'borderColor',
  'borderBottomColor',
  'borderEndColor',
  'borderLeftColor',
  'borderRightColor',
  'borderStartColor',
  'borderTopColor',
  'borderRadius',
  'borderBottomEndRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomStartRadius',
  'borderTopEndRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopStartRadius',
  'borderStyle',
  'borderBottomStyle',
  'borderEndStyle',
  'borderLeftStyle',
  'borderRightStyle',
  'borderStartStyle',
  'borderTopStyle',
  'cursor',
  'touchAction',
  'userSelect',
  'willChange',
  'alignContent',
  'alignItems',
  'alignSelf',
  'backfaceVisibility',
  'borderWidth',
  'borderBottomWidth',
  'borderEndWidth',
  'borderLeftWidth',
  'borderRightWidth',
  'borderStartWidth',
  'borderTopWidth',
  'bottom',
  'boxSizing',
  'direction',
  'display',
  'end',
  'flex',
  'flexBasis',
  'flexDirection',
  'flexGrow',
  'flexShrink',
  'flexWrap',
  'height',
  'justifyContent',
  'left',
  'margin',
  'marginBottom',
  'marginHorizontal',
  'marginEnd',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginTop',
  'marginVertical',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'order',
  'overflow',
  'overflowX',
  'overflowY',
  'padding',
  'paddingBottom',
  'paddingHorizontal',
  'paddingEnd',
  'paddingLeft',
  'paddingRight',
  'paddingStart',
  'paddingTop',
  'paddingVertical',
  'position',
  'right',
  'start',
  'top',
  'visibility',
  'width',
  'zIndex',
  'aspectRatio',
  'gridAutoColumns',
  'gridAutoFlow',
  'gridAutoRows',
  'gridColumnEnd',
  'gridColumnGap',
  'gridColumnStart',
  'gridRowEnd',
  'gridRowGap',
  'gridRowStart',
  'gridTemplateColumns',
  'gridTemplateRows',
  'gridTemplateAreas',
  'shadowColor',
  'shadowOffset',
  'shadowOpacity',
  'shadowRadius',
  'shadowSpread',
  'perspective',
  'perspectiveOrigin',
  'transform',
  'transformOrigin',
  'transformStyle',
  'backgroundColor',
  'opacity',
  'elevation',
  'backgroundAttachment',
  'backgroundBlendMode',
  'backgroundClip',
  'backgroundImage',
  'backgroundOrigin',
  'backgroundPosition',
  'backgroundRepeat',
  'backgroundSize',
  'boxShadow',
  'clip',
  'filter',
  'outline',
  'outlineColor',
  'overscrollBehavior',
  'overscrollBehaviorX',
  'overscrollBehaviorY',
  'WebkitMaskImage',
  'WebkitOverflowScrolling',
];
