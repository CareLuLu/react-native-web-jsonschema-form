import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import {
  each,
  uniq,
  flatten,
  indexOf,
  omit,
  isArray,
} from 'lodash';
import { Screen, Column, Row } from 'react-native-web-ui-components';
import { Helmet, style } from 'react-native-web-ui-components/Helmet';
import { ucfirst, withPrefix } from '../../utils/string';

const styles = StyleSheet.create({
  labelTop: {
    fontWeight: 'bold',
    paddingBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 5,
  },
  grid: {
    marginLeft: -10,
    alignItems: 'center',
  },
  item: {
    paddingLeft: 10,
  },
});

const attributes = ['type', 'children', 'style', 'columns'];

const getField = type => `${ucfirst(type)}Field`;

const isValid = (key, pick, omitted, include) => (
  (include.length && include.indexOf(key) >= 0) || (
    (!pick.length || pick.indexOf(key) >= 0)
    && (!omitted.length || omitted.indexOf(key) < 0)
  )
);

const orderedKeys = (schema, uiSchema) => uniq((uiSchema['ui:order'] || []).concat(Object.keys(schema.properties)));

const orderedEach = (schema, uiSchema, iterator) => {
  const keys = orderedKeys(schema, uiSchema);
  each(keys, key => iterator(schema.properties[key], key));
};

const renderGridItem = (props, gridItem, properties, key, zIndex, first) => {
  if (gridItem.type === 'label') {
    const { widgets } = props;
    const { LabelWidget } = widgets;
    return (
      <LabelWidget
        key={`item-${key}`}
        hasError={false}
        style={[first ? styles.labelTop : styles.label, gridItem.style]}
      >
        {gridItem.children}
      </LabelWidget>
    );
  }
  const Component = gridItem.type === 'column' ? Column : Row;
  const columns = gridItem.columns || [];
  const screenType = Screen.getType();
  const gridStyle = screenType !== 'xs' && gridItem.type === 'grid' ? styles.grid : null;
  return (
    <Component
      className={`ObjectField__${gridItem.type}`}
      key={`item-${key}`}
      {...omit(gridItem, attributes)}
      style={[gridItem.style, { zIndex }, gridStyle]}
    >
      {Screen.getType() !== 'xs' ? (
        <Helmet>
          <style>
            {`
              .ObjectField__grid {
                width: calc(100% + 10px);
              }
            `}
          </style>
        </Helmet>
      ) : null}
      {gridItem.children.map((child, i) => {
        if (typeof child === 'string') {
          let PropertyContainer;
          let propertyContainerProps;
          if (gridItem.type === 'grid') {
            const column = (isArray(columns) ? columns[i] : columns) || {};
            PropertyContainer = Row;
            propertyContainerProps = {
              style: screenType !== 'xs' ? styles.item : null,
              ...column,
            };
          } else {
            PropertyContainer = React.Fragment;
            propertyContainerProps = {};
          }
          const PropertyComponent = properties[child];
          if (!PropertyComponent) {
            return null;
          }
          let newFocus = props.focus;
          if (first && props.focusFirst) {
            newFocus = PropertyComponent.key;
          }
          return (
            <PropertyContainer key={PropertyComponent.key} {...propertyContainerProps}>
              <PropertyComponent
                {...props}
                focus={newFocus}
                zIndex={gridItem.children.length - i}
                gridItemType={gridItem.type}
                gridItemIndex={i}
                gridItemLength={gridItem.children.length}
              />
            </PropertyContainer>
          );
        }
        return renderGridItem(props, child, properties, `${key}-${i}`, gridItem.children.length - i, false);
      })}
    </Component>
  );
};

class ObjectField extends React.PureComponent {
  static propTypes = {
    cached: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    schema: PropTypes.shape({}).isRequired,
    options: PropTypes.shape({}).isRequired,
    uiSchema: PropTypes.shape({}).isRequired,
    errorSchema: PropTypes.shape({}).isRequired,
    fields: PropTypes.shape({}).isRequired,
  };

  render() {
    const {
      cached,
      name,
      schema,
      uiSchema,
      options,
      fields,
    } = this.props;
    const hasCache = !!(cached && this.cache);
    if (!hasCache) {
      const properties = {};
      const defaultUiSchema = uiSchema['*'] || {};
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
      const omitted = uiSchema['ui:omit'] || [];
      const include = uiSchema['ui:include'] || [];
      orderedEach(schema, uiSchema, (propertySchema, propertyKey) => {
        if (isValid(propertyKey, pick, omitted, include)) {
          const propertyName = withPrefix(propertyKey, name);
          const propertyUiSchema = Object.assign(
            {},
            defaultUiSchema,
            uiSchema[propertyKey] || {},
            { '*': defaultUiSchema || uiSchema['*'] },
          );
          const PropertyField = fields[getField(propertySchema.type)];
          const onFocus = childName => options.onFocus(childName || propertyName);
          const onChange = (value, childName, silent) => options
            .onChange(value, childName || propertyName, silent);
          const PropertyComponent = props => (
            <PropertyField
              {...props}
              name={propertyName}
              schema={propertySchema}
              uiSchema={propertyUiSchema}
              errorSchema={props.errorSchema[propertyKey] || {}}
              onChange={onChange}
              onFocus={onFocus}
              onSubmit={options.onSubmit}
              options={options}
              disabled={!!propertyUiSchema['ui:disabled']}
              readonly={!!propertyUiSchema['ui:readonly']}
            />
          );
          PropertyComponent.key = propertyName;
          PropertyComponent.propertyKey = propertyKey;
          properties[propertyKey] = PropertyComponent;
        }
      });
      const grid = uiSchema['ui:grid'] || [{
        type: 'column',
        xs: 12,
        children: orderedKeys(schema, uiSchema),
      }];
      const Widget = props => (
        <React.Fragment>
          {grid.map((gridItem, i) => renderGridItem(
            props,
            gridItem,
            properties,
            i,
            grid.length - i,
            i === 0,
          ))}
        </React.Fragment>
      );
      const { BaseField } = fields;
      this.cache = props => <BaseField {...props} field={this} widget={Widget} zIndex={1} />;
    }
    return this.cache({ ...this.props, cached: hasCache });
  }
}

export default ObjectField;
