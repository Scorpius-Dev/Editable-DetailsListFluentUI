// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IUserDefinedOperationKey } from '../types/editabledetailslistprops';
import { _Operation } from '../types/operation';

import { initializeIcons } from '@fluentui/react/lib/Icons';

initializeIcons(undefined, { disableWarnings: true });

export type InternalEditableGridProperties = {
  _grid_row_id_: number;
  _grid_row_operation_: number | string;
  _is_filtered_in_: boolean;
  _is_filtered_in_grid_search_: boolean;
  _is_filtered_in_column_filter_: boolean;
  _is_data_transformed: boolean;
};

export const InternalEditableGridPropertiesKeys: readonly (keyof InternalEditableGridProperties)[] =
  [
    '_grid_row_id_',
    '_grid_row_operation_',
    '_is_filtered_in_',
    '_is_filtered_in_grid_search_',
    '_is_filtered_in_column_filter_',
    '_is_data_transformed'
  ] as const;

export const InitializeInternalGrid = (
  items: any[],
  customOperationsKey: IUserDefinedOperationKey | undefined
): any[] => {
  return items.map((obj: InternalEditableGridProperties, index) => {
    if (
      Object.keys(obj).indexOf('_grid_row_id_') == -1 &&
      Object.keys(obj).indexOf('_grid_row_operation_') == -1
    ) {
      obj._grid_row_id_ = index;
      obj._is_filtered_in_ = true;
      obj._is_filtered_in_grid_search_ = true;
      obj._is_filtered_in_column_filter_ = true;
      obj._is_data_transformed = false;

      if (customOperationsKey && items[index][customOperationsKey.colKey] !== undefined) {
        switch (items[index][customOperationsKey.colKey]) {
          case customOperationsKey.options.Add:
            obj._grid_row_operation_ = _Operation.Add;
            break;
          case customOperationsKey.options.Update:
            obj._grid_row_operation_ = _Operation.Update;
            break;
          case customOperationsKey.options.Delete:
            obj._grid_row_operation_ = _Operation.Delete;
            break;

          default:
            obj._grid_row_operation_ = _Operation.None;
            break;
        }
      } else {
        obj._grid_row_operation_ = _Operation.None;
      }
    }

    return obj;
  });
};

export const ResetGridRowID = (items: any[]): any[] => {
  return items.map((obj, index) => {
    obj._grid_row_id_ = index;

    return obj;
  });
};

export const InitializeInternalGridEditStructure = (items: any[]): any[] => {
  let activateCellEditTmp: any[] = [];
  items.forEach((item, index) => {
    let activateCellEditRowTmp: any = { isActivated: false, properties: {} };
    var objectKeys = Object.keys(item);
    objectKeys.forEach((objKey) => {
      activateCellEditRowTmp.properties[objKey] = {
        activated: false,
        value: item[objKey],
        error: null
      };
    });

    activateCellEditTmp.push(activateCellEditRowTmp);
  });

  return activateCellEditTmp;
};

export const ShallowCopyDefaultGridToEditGrid = (defaultGrid: any[], editGrid: any[]): any[] => {
  for (let index = 0; index < defaultGrid.length; index++) {
    const item = defaultGrid[index];
    const objectKeys = Object.keys(item);
    for (let j = 0; j < objectKeys.length; j++) {
      const objKey = objectKeys[j];
      editGrid[index].properties[objKey]['value'] = item[objKey];
    }
  }

  return editGrid;
};

export const ShallowCopyEditGridToDefaultGrid = (
  defaultGrid: any[],
  editGrid: any[],
  customOperationsKey: IUserDefinedOperationKey | undefined
): any[] => {
  editGrid.forEach((item) => {
    var index = defaultGrid.findIndex(
      (row) => row._grid_row_id_ == item.properties._grid_row_id_.value
    );
    if (index >= 0) {
      var objectKeys = Object.keys(item.properties);
      objectKeys.forEach((objKey) => {
        if (defaultGrid[index][objKey] != item.properties[objKey].value) {
          defaultGrid[index][objKey] = item.properties[objKey].value;

          if (
            defaultGrid[index]['_grid_row_operation_'] != _Operation.Add &&
            defaultGrid[index]['_grid_row_operation_'] != _Operation.Update
          ) {
            defaultGrid[index]['_grid_row_operation_'] = _Operation.Update;

            if (customOperationsKey && defaultGrid[index][customOperationsKey.colKey] !== undefined)
              defaultGrid[index][customOperationsKey.colKey] =
                customOperationsKey.options?.Update ?? _Operation.Update;
          }
        }
      });
    }
  });

  return defaultGrid;
};
