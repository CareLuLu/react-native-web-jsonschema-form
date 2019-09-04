import React from 'react';
import { StyleSheet } from 'react-native';
import { omit, isString, isArray } from 'lodash';
import View from 'react-native-web-ui-components/View';
import Row from 'react-native-web-ui-components/Row';
import Column from 'react-native-web-ui-components/Column';
import Screen from 'react-native-web-ui-components/Screen';
import { Helmet, style } from 'react-native-web-ui-components/Helmet';
import { getComponent, withPrefix } from '../../utils';

/* eslint react/prop-types: 0 */
/* eslint no-use-before-define: 0 */

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
    alignItems: 'flex-start',
  },
  item: {
    paddingLeft: 10,
  },
});

const attributes = ['type', 'children', 'style', 'columns'];

const getMeta = (schema) => {
  if (schema.type === 'array') {
    return [];
  }
  return {};
};

const createProperty = (property, gridItem, index, params) => {
  const {
    name,
    schema,
    fields,
  } = params;
  const propertySchema = schema.properties[property];
  const propertyName = withPrefix(property, name);

  if (!propertySchema) {
    const UnexistentProperty = () => null;
    UnexistentProperty.key = propertyName;
    return UnexistentProperty;
  }

  const PropertyComponent = getComponent(propertySchema.type, 'Field', fields);
  if (!PropertyComponent) {
    const UnexistentPropertyComponent = () => null;
    UnexistentPropertyComponent.key = propertyName;
    return UnexistentPropertyComponent;
  }

  let PropertyContainer;
  let propertyContainerProps;
  if (gridItem.type === 'grid') {
    const columns = gridItem.columns || [];
    const column = (isArray(columns) ? columns[index] : columns) || {};
    PropertyContainer = Row;
    propertyContainerProps = {
      style: [
        Screen.getType() !== 'xs' ? styles.item : null,
        { zIndex: gridItem.children.length - index },
        column.style || null,
      ],
      ...column,
    };
  } else {
    PropertyContainer = React.Fragment;
    propertyContainerProps = {};
  }
  const Property = ({
    value,
    meta,
    errors,
    uiSchema,
    ...props
  }) => (
    <PropertyContainer key={propertyName} {...propertyContainerProps}>
      <PropertyComponent
        {...props}
        value={value && value[property]}
        meta={(meta && meta[property]) || getMeta(propertySchema)}
        errors={errors && errors[property]}
        name={propertyName}
        schema={propertySchema}
        uiSchema={uiSchema[property]}
        gridItemType={gridItem.type}
        gridItemIndex={index}
        gridItemLength={gridItem.children.length}
        zIndex={gridItem.children.length - index}
      />
    </PropertyContainer>
  );
  Property.key = propertyName;
  return Property;
};

const getLabelComponent = ({
  key,
  first,
  params,
  gridItem,
}) => {
  const { widgets } = params;
  const Widget = widgets.LabelWidget;
  const Label = props => (
    <Widget
      {...props}
      key={key}
      hasError={false}
      hasTitle
      toggleable={false}
      style={[first ? styles.labelTop : styles.label, gridItem.style]}
    >
      {gridItem.children}
    </Widget>
  );
  Label.key = key;
  return Label;
};

const getGeneralComponent = ({
  gridItem,
  key,
  zIndex,
  params,
}) => {
  let Wrapper;
  if (gridItem.type === 'column') {
    Wrapper = Column;
  } else if (gridItem.type === 'view') {
    Wrapper = View;
  } else {
    Wrapper = Row;
  }
  const gridStyle = Screen.getType() !== 'xs' && gridItem.type === 'grid' ? styles.grid : null;
  const items = gridItem.children.map((child, i) => {
    if (isString(child)) {
      return createProperty(child, gridItem, i, params);
    }
    return createGridItem({
      params,
      gridItem: child,
      key: `${key}-${i}`,
      zIndex: gridItem.children.length - i,
      first: i === 0,
    });
  });
  const GridItem = props => (
    <Wrapper
      className={`FormGridItem__${gridItem.type}`}
      {...omit(gridItem, attributes)}
      style={[gridItem.style, { zIndex }, gridStyle]}
    >
      {items.map(Child => <Child key={Child.key} {...props} />)}
    </Wrapper>
  );
  GridItem.key = key;
  return GridItem;
};

const createGridItem = (props) => {
  const { gridItem } = props;
  if (gridItem.type === 'label') {
    return getLabelComponent(props);
  }
  return getGeneralComponent(props);
};

const createGrid = (grid, params) => {
  const items = grid.map((gridItem, i) => createGridItem({
    params,
    gridItem,
    first: i === 0,
    zIndex: grid.length - i,
    key: `${params.name}-${i}`,
  }));
  return (props) => {
    const currentStyle = props.style; // eslint-disable-line
    return (
      <Row style={currentStyle}>
        {Screen.getType() !== 'xs' ? (
          <Helmet>
            <style>
              {`
                [data-class~="FormGridItem__grid"] {
                  width: calc(100% + 10px);
                }
              `}
            </style>
          </Helmet>
        ) : null}
        {items.map(GridItem => <GridItem key={GridItem.key} {...props} />)}
      </Row>
    );
  };
};

export default createGrid;
