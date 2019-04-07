import React from 'react';
import { StyleSheet } from 'react-native';
import { omit, isString, isArray } from 'lodash';
import Row from 'react-native-web-ui-components/Row';
import Column from 'react-native-web-ui-components/Column';
import Screen from 'react-native-web-ui-components/Screen';
import { Helmet, style } from 'react-native-web-ui-components/Helmet';
import { getComponent, withPrefix } from '../../utils';

/* eslint react/prop-types: 0 */

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

const createProperty = (property, gridItem, index, params) => {
  let PropertyContainer;
  let propertyContainerProps;
  if (gridItem.type === 'grid') {
    const columns = gridItem.columns || [];
    const column = (isArray(columns) ? columns[index] : columns) || {};
    PropertyContainer = Row;
    propertyContainerProps = {
      style: Screen.getType() !== 'xs' ? styles.item : null,
      ...column,
    };
  } else {
    PropertyContainer = React.Fragment;
    propertyContainerProps = {};
  }
  const {
    name,
    schema,
    fields,
  } = params;
  const propertyName = withPrefix(property, name);
  const propertySchema = schema.properties[property];
  const PropertyComponent = getComponent(propertySchema.type, 'Field', fields);
  if (!PropertyComponent) {
    return null;
  }
  const Property = ({
    value,
    errors,
    uiSchema,
    ...props
  }) => (
    <PropertyContainer key={propertyName} {...propertyContainerProps}>
      <PropertyComponent
        {...props}
        value={value && value[property]}
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

const createGridItem = (
  gridItem,
  key,
  zIndex,
  first,
  params,
) => {
  const { widgets } = params;
  if (gridItem.type === 'label') {
    const Widget = widgets.LabelWidget;
    const Label = () => (
      <Widget
        key={key}
        hasError={false}
        style={[first ? styles.labelTop : styles.label, gridItem.style]}
      >
        {gridItem.children}
      </Widget>
    );
    Label.key = key;
    return Label;
  }
  const Wrapper = gridItem.type === 'column' ? Column : Row;
  const gridStyle = Screen.getType() !== 'xs' && gridItem.type === 'grid' ? styles.grid : null;
  const items = gridItem.children.map((child, i) => {
    if (isString(child)) {
      return createProperty(child, gridItem, i, params);
    }
    return createGridItem(child, `${key}-${i}`, gridItem.children.length - i, i === 0, params);
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

const createGrid = (grid, params) => {
  const items = grid.map((gridItem, i) => createGridItem(
    gridItem,
    `${params.name}-${i}`,
    grid.length - i,
    i === 0,
    params,
  ));
  return props => (
    <React.Fragment>
      {Screen.getType() !== 'xs' ? (
        <Helmet>
          <style>
            {`
              .FormGridItem__grid {
                width: calc(100% + 10px);
              }
            `}
          </style>
        </Helmet>
      ) : null}
      {items.map(GridItem => <GridItem key={GridItem.key} {...props} />)}
    </React.Fragment>
  );
};

export default createGrid;
