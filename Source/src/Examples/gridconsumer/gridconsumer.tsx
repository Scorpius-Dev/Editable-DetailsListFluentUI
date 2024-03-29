/* eslint-disable @typescript-eslint/ban-ts-comment */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Checkbox,
  CheckboxVisibility,
  DetailsListLayoutMode,
  DetailsRow,
  FocusZoneDirection,
  FocusZoneTabbableElements,
  FontIcon,
  IButtonProps,
  IDetailsColumnRenderTooltipProps,
  IDetailsHeaderProps,
  IDetailsHeaderStyles,
  IDetailsList,
  IDetailsRowProps,
  IDetailsRowStyles,
  IRenderFunction,
  ISearchBoxProps,
  IStackTokens,
  Link,
  mergeStyles,
  mergeStyleSets,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  SelectionMode,
  Stack,
  StackItem,
  Sticky,
  StickyPositionType,
  TooltipHost
} from '@fluentui/react';

import { ITeachingBubbleConfig, teachingBubbleConfig } from '../gridconsumer/teachingbubbleconfig';
import EditableGrid from '../../libs/editablegrid/editablegrid';
import { ICallBackParams } from '../../libs/types/callbackparams';
import {
  IColumnConfig,
  IDetailsColumnRenderTooltipPropsExtra
} from '../../libs/types/columnconfigtype';
import { _Operation } from '../../libs/types/operation';
import { useCallback, useEffect, useState } from 'react';
import { GridColumnConfig, GridItemsType } from './gridconfig';
import React from 'react';
import { IEnableMessageBarErrors } from '../../libs/types/editabledetailslistprops';

interface GridConfigOptions {
  showASaveButtonInCommandbar: boolean;
  enableEditAllOnCellClick: boolean;
  disableInlineCellEdit: boolean;
  enableInlineGridAdd: boolean;
  disableAllRowActions: boolean;
  enableSingleCellEditOnDoubleClick: boolean;
  enableRowEditDelete: boolean;
  enableRowEdit: boolean;
  enableRowEditCancel: boolean;
  enableBulkEdit: boolean;
  enableSaveGridOnCellValueChange: boolean;
  enableMessageBarErrors: IEnableMessageBarErrors;
  enableColumnEdit: boolean;
  enableCSVExport: boolean;
  enableExcelExport: boolean;
  enableExcelImport: boolean;
  enableEditMode: boolean;
  enableEditModeCancel: boolean;
  enableGridRowsDelete: boolean;
  enableGridRowsAdd: boolean;
  enableColumnFilterRules: boolean;
  enableGridRowAddWithValues: boolean;
  enableGridCopy: boolean;
  enableGridPaste: boolean;
  enableSingleRowCopy: true;
  enableGridReset: boolean;
  enableColumnFilters: boolean;
  enableDefaultEditMode: boolean;
  enableSearchBox: {
    enable: boolean;
    searchType?: 'contains' | 'startswith';
    props?: Partial<ISearchBoxProps>;
  };
}

const Consumer = () => {
  const detailsListRef = React.useRef<IDetailsList>(null);
  const [items, setItems] = useState<GridItemsType[]>([]);
  const [teachingBubbleVisible, setToggleTeachingBubbleVisible] = useState(true);
  const [teachingBubblePropsConfig, setTeachingBubblePropsConfig] = useState<ITeachingBubbleConfig>(
    {
      id: 0,
      config: {
        ...teachingBubbleConfig[0],
        footerContent: `1 of ${teachingBubbleConfig.length}`
      }
    }
  );
  const [gridConfigOptions, setGridConfigOptions] = useState<GridConfigOptions>({
    showASaveButtonInCommandbar: false,
    enableEditAllOnCellClick: false,
    disableInlineCellEdit: false,
    enableInlineGridAdd: true,
    disableAllRowActions: false,
    enableMessageBarErrors: {
      enableShowErrors: true,
      enableSendGroupedErrorsToCallback: true
    },
    enableSaveGridOnCellValueChange: true,
    enableSingleCellEditOnDoubleClick: true,
    enableRowEditDelete: true,
    enableRowEdit: true,
    enableRowEditCancel: true,
    enableBulkEdit: true,
    enableColumnEdit: true,
    enableExcelExport: true,
    enableExcelImport: true,
    enableCSVExport: true,
    enableEditMode: true,
    enableEditModeCancel: true,
    enableGridRowsDelete: true,
    enableGridRowsAdd: true,
    enableColumnFilterRules: true,
    enableGridRowAddWithValues: true,
    enableGridCopy: true,
    enableGridPaste: true,
    enableSingleRowCopy: true,
    enableGridReset: true,
    enableColumnFilters: true,
    enableDefaultEditMode: false,
    enableSearchBox: {
      enable: true,
      searchType: 'contains',
      props: {
        placeholder: 'Search'
      }
    }
  });

  const RowSize = 5;

  const classNames = mergeStyleSets({
    controlWrapper: {
      display: 'flex',
      flexWrap: 'wrap'
    },
    detailsDiv: {
      border: '3px solid black'
    },
    detailsValues: {
      color: '#0078d4'
    },
    checkbox: {
      width: '250px'
    }
  });

  const gapStackTokens: IStackTokens = {
    childrenGap: 10,
    padding: 2
  };

  const iconClass = mergeStyles({
    fontSize: 20,
    margin: '0px 0px 0px 30px'
  });

  const onTeachingBubbleNavigation = (direction: string) => {
    switch (direction) {
      case 'previous':
        var TeachingProps = teachingBubbleConfig[teachingBubblePropsConfig.id - 1];
        var currentId = teachingBubblePropsConfig.id - 1;
        TeachingProps.footerContent = `${currentId + 1} of ${teachingBubbleConfig.length}`;
        setTeachingBubblePropsConfig({ id: currentId, config: TeachingProps });
        break;
      case 'next':
        var TeachingProps = teachingBubbleConfig[teachingBubblePropsConfig.id + 1];
        var currentId = teachingBubblePropsConfig.id + 1;
        TeachingProps.footerContent = `${currentId + 1} of ${teachingBubbleConfig.length}`;
        setTeachingBubblePropsConfig({ id: currentId, config: TeachingProps });
        break;
      case 'close':
        var TeachingProps = teachingBubbleConfig[0];
        TeachingProps.footerContent = `1 of ${teachingBubbleConfig.length}`;
        setTeachingBubblePropsConfig({ id: 0, config: TeachingProps });
        setToggleTeachingBubbleVisible(false);
        break;
    }
  };

  const nextBubbleProps: IButtonProps = {
    children: 'Next',
    onClick: () => onTeachingBubbleNavigation('next')
  };

  const previousBubbleProps: IButtonProps = {
    children: 'Previous',
    onClick: () => onTeachingBubbleNavigation('previous')
  };
  const closeButtonProps: IButtonProps = {
    children: 'Close',
    onClick: () => onTeachingBubbleNavigation('close')
  };

  const GetRandomDate = (start: Date, end: Date): Date => {
    var diff = end.getTime() - start.getTime();
    var new_diff = diff * Math.random();
    var date = new Date(start.getTime() + new_diff);
    return date;
  };

  const GetRandomInt = (min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const SetDummyData = (): void => {
    var dummyData: GridItemsType[] = [];

    for (var i = 1; i <= 4; i++) {
      var randomInt = GetRandomInt(1, 3);
      dummyData.push({
        //@ts-ignore true error, but ignoring as it's just for testing items manipulations
        operationType: 'None',
        id: i,
        combo: 'aaaa',
        excluded: randomInt % 2 == 0 ? true : false,
        // customerhovercol: "Hover Me",
        name: 'co',
        password: 'not important',
        age: GetRandomInt(20, 40),
        designation: 'Designation' + GetRandomInt(1, 15),
        salary: GetRandomInt(35000, 75000),
        // dateofjoining: new Date(),
        payrolltype: randomInt % 3 == 0 ? 'WK' : randomInt % 3 == 1 ? 'BI' : 'MT',
        employmenttype: 'Employment Type' + GetRandomInt(1, 12)
        // employeelink: "Link",
      });
    }
    setItems(dummyData);
  };

  useEffect(() => {
    SetDummyData();
    // setTimeout(   ()=> SetDummyData(), 100    )
  }, []);

  const onGridSave = (internalGridData: any[], updatedItems: any): void => {
    LogRows(internalGridData);
    setItems([
      ...internalGridData
      // .filter((y) => y._grid_row_operation_ != _Operation.Delete)
      // .map((x) => {
      //   return { ...x, _grid_row_operation_: _Operation.None };
      // }),
    ]);
  };

  const onGridUpdate = async (internalGridData: any[]): Promise<void> => {
    console.log('Grid Data Updated');
    LogRows(internalGridData);
  };

  const onGridFiltered = (filterData: any[] | null): void => {
    console.log('Grid Data Filtered');
    console.log(filterData);
  };

  const LogRows = (data: any[]): void => {
    console.log('Updated Rows');
    console.log(data.filter((item) => item._grid_row_operation_ == _Operation.Update));
    console.log('Added Rows');
    console.log(data.filter((item) => item._grid_row_operation_ == _Operation.Add));
    console.log('Deleted Rows');
    console.log(data.filter((item) => item._grid_row_operation_ == _Operation.Delete));
    console.log('Unchanged Rows');
    console.log(data.filter((item) => item._grid_row_operation_ == _Operation.None));
  };

  const onPayrollChanged = (callbackRequestParamObj: ICallBackParams): any[] => {
    // alert("Payroll Changed");
    return callbackRequestParamObj.data;
  };

  const onDateChanged = (callbackRequestParamObj: ICallBackParams): any[] => {
    alert('Date Changed');
    return callbackRequestParamObj.data;
  };

  const onEmploymentTypeChanged = (callbackRequestParamObj: ICallBackParams): any[] => {
    alert('Employment Type Changed');
    return callbackRequestParamObj.data;
  };

  const onDesignationChanged = (callbackRequestParamObj: ICallBackParams): any[] => {
    callbackRequestParamObj.rowindex.forEach((index) => {
      callbackRequestParamObj.data
        .filter((item) => item._grid_row_id_ == index)
        .map((item) => (item.salary = 30000));
    });

    return callbackRequestParamObj.data;
  };

  const [data, setData] = useState('Ty');
  const [asyncValues, setAsyncValues] = useState<Map<string, string>>(new Map());

  const [col, setCol] = useState(GridColumnConfig);

  const onDesignationChangedTest = (callbackRequestParamObj: ICallBackParams): any[] => {
    for (let j = 0; j < callbackRequestParamObj.rowindex.length; j++) {
      const index = callbackRequestParamObj.rowindex[j];
      const filteredItems = callbackRequestParamObj.data.filter(
        (item) => item._grid_row_id_ == index
      );
      for (let i = 0; i < filteredItems.length; i++) {
        const item = filteredItems[i];
        item.salary = 888;
      }
    }

    return callbackRequestParamObj.data;
  };

  const checkForDup = (callbackRequestParamObj: ICallBackParams): any[] => {
    const exampleOfListOfAlias = ['somerUser1', 'someUser2'];
    if (exampleOfListOfAlias.includes(callbackRequestParamObj.data['name'].value)) {
      callbackRequestParamObj.data['name'].error = 'User Alias is duplicated';
    }

    //@ts-ignore
    return Object.assign(
      { errorMessage: '', data: callbackRequestParamObj.data },
      callbackRequestParamObj
    );
  };

  const attachGridValueChangeCallbacks = (columnConfig: IColumnConfig[]): IColumnConfig[] => {
    // columnConfig
    //   .filter((item) => item.key == "designation")
    //   .map((item) => (item.onChange = onDesignationChangedTest));

    // columnConfig.filter((item) => item.key == 'employmenttype').map((item) => item.onChange = onEmploymentTypeChanged);
    columnConfig
      .filter((item) => item.key == 'payrolltype')
      .map((item) => (item.onChange = onPayrollChanged));
    //columnConfig.filter((item) => item.key == 'dateofjoining').map((item) => item.onChange = onDateChanged);
    return columnConfig;
  };

  // const attachGridValueChangeCallbacks = useCallback(
  //   (columnConfig: IColumnConfig[]): IColumnConfig[] => {
  //     const filteredItems = columnConfig.filter(
  //       (item) => item.key === "designation"
  //     );
  //     for (let i = 0; i < filteredItems.length; i++) {
  //       filteredItems[i].onChange = onDesignationChangedTest;
  //     }

  //     return columnConfig;
  //   },
  //   [onDesignationChangedTest]
  // );

  const onCheckboxChange = (
    ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ): void => {
    setGridConfigOptions({
      ...gridConfigOptions,
      [(ev!.target as Element).id]:
        // @ts-ignore: Strange
        !gridConfigOptions[(ev!.target as Element).id]
    });
  };

  const tableHeaderStyles = (): Partial<IDetailsHeaderStyles> => {
    return {
      root: {
        fontWeight: 200,
        paddingTop: 0,
        '.ms-DetailsHeader-cell': {
          whiteSpace: 'normal',
          textOverflow: 'clip',
          lineHeight: 'normal',
          textAlign: 'center',
          backgroundColor: '#DBE5E6',
          borderWidth: '0px 0px 1px 1px',
          borderColor: 'rgba(0,0,0,0.35)',
          borderStyle: 'solid'
        },
        '.ms-DetailsHeader-cellTitle': {
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center'
        },
        '.ms-DetailsHeader-cellName': {
          fontFamily: 'Segoe UI',
          alignItems: 'center',
          fontSize: '16px',
          fontWeight: 400
        }
      }
    };
  };

  const tableDetailsRowsStyles = () => (): Partial<IDetailsRowStyles> => {
    return {
      root: [
        {
          fontSize: '14px',
          backgroundColor: 'white'
        }
      ],
      cell: {
        borderWidth: '0px 0px 1px 1px',
        borderColor: 'rgba(0,0,0,0.35)',
        borderStyle: 'solid',
        alignItems: 'center'
      },
      isMultiline: {
        alignItems: 'center'
      }
    };
  };

  const onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (props, defaultRender) => {
    if (!props || !defaultRender) return null;

    const onRenderColumnHeaderTooltip: IRenderFunction<IDetailsColumnRenderTooltipPropsExtra> = (
      tooltipHostProps
    ) => {
      return <TooltipHost {...tooltipHostProps} content={tooltipHostProps?.column?.name ?? ''} />;
    };

    return (
      <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
        {defaultRender!({
          ...props,
          onRenderColumnHeaderTooltip:
            onRenderColumnHeaderTooltip as IRenderFunction<IDetailsColumnRenderTooltipProps>,
          styles: tableHeaderStyles
        })}
      </Sticky>
    );
  };

  // const Messages = useRef(new Map());
  const [Messages, SetMessages] = useState(new Map());
  const [messageBarType, setMessageBarType] = useState<MessageBarType>(MessageBarType.info);

  const onRenderRow = (
    props?: IDetailsRowProps,
    defaultRender?: IRenderFunction<IDetailsRowProps>
  ) => {
    if (!props || !defaultRender) return null;
    return (
      <DetailsRow
        {...props}
        id={`${'GridRow'}-${props.itemIndex}`}
        focusZoneProps={{
          direction: FocusZoneDirection.horizontal,
          handleTabKey: FocusZoneTabbableElements.all,
          isCircularNavigation: true
        }} /* styles={tableDetailsRowsStyles()} */
      />
    );
  };

  const insertToMap = (mapVar: Map<any, any>, key: any, value: any) => {
    mapVar.set(key, value);
    return mapVar;
  };

  const removeFromMap = (mapVar: Map<any, any>, key: any) => {
    mapVar.delete(key);
    return mapVar;
  };

  const onRenderMsg = useCallback(() => {
    let messageTmp: JSX.Element[] = [];

    Messages.forEach(function (value, key) {
      messageTmp.push(
        <MessageBar
          key={key}
          messageBarType={messageBarType}
          onDismiss={() => removeFromMap(new Map(Messages), key)}
        >
          {value}
        </MessageBar>
      );
    });
    return messageTmp;
  }, [Messages]);

  const [saveAction, setSaveAction] = useState<() => Promise<boolean>>();
  const [clearGridMessages, setClearGridMessages] = useState(false);

  return (
    <Stack grow horizontalAlign="center">
      <div style={{ width: '75%' }}>
        <legend>
          <b>Toggle:</b>
        </legend>
        <Stack
          wrap
          horizontal
          horizontalAlign="center"
          className={classNames.detailsDiv}
          tokens={{ childrenGap: 5, padding: 10 }}
        >
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'showASaveButtonInCommandbar'}
              label="Show A Save Button In Commandbar"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.showASaveButtonInCommandbar}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableEditAllOnCellClick'}
              label="Edit All Rows On Cell Click"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableEditAllOnCellClick}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableSingleCellEditOnDoubleClick'}
              label="Edit Cell On Double Click"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableSingleCellEditOnDoubleClick}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'disableInlineCellEdit'}
              label="Disable Edit On Cell Double / Single Click"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.disableInlineCellEdit}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableSaveGridOnCellValueChange'}
              label="Save Grid On Cell Value Change"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableSaveGridOnCellValueChange}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableRowEdit'}
              label="Row Edit"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableRowEdit}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableSingleRowCopy'}
              label="Row Single Copy"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableSingleRowCopy}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableRowEditDelete'}
              label="Row Single Delete"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableRowEditDelete}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableRowEditCancel'}
              label="Row Edit Cancel"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableRowEditCancel}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableBulkEdit'}
              label="Bulk Edit"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableBulkEdit}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableColumnEdit'}
              label="Column Edit"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableColumnEdit}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableCSVExport'}
              label="Export CSV"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableCSVExport}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableExcelExport'}
              label="Export Excel"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableExcelExport}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableExcelImport'}
              label="Import From Excel"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableExcelImport}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableEditMode'}
              label="TextField Edit Mode"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableEditMode}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableEditModeCancel'}
              label="TextField Edit Mode Cancel"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableEditModeCancel}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableGridRowsDelete'}
              label="Delete Rows"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableGridRowsDelete}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableInlineGridAdd'}
              label="Add Rows Inline"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableInlineGridAdd}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableGridRowsAdd'}
              label="Add Blank Rows"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableGridRowsAdd}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableColumnFilterRules'}
              label="Rule Based Filter"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableColumnFilterRules}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableGridRowAddWithValues'}
              label="Add Rows w/ Values"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableGridRowAddWithValues}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableGridCopy'}
              label="Grid Copy"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableGridCopy}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableGridPaste'}
              label="Grid Paste"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableGridPaste}
            />
          </StackItem>

          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableGridReset'}
              label="Grid Reset"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableGridReset}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableColumnFilters'}
              label="Column Filters"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableColumnFilters}
            />
          </StackItem>
          <StackItem className={classNames.checkbox}>
            <Checkbox
              id={'enableDefaultEditMode'}
              label="Default Edit Mode"
              onChange={onCheckboxChange}
              checked={gridConfigOptions.enableDefaultEditMode}
            />
          </StackItem>
        </Stack>
      </div>
      <div className={classNames.controlWrapper}>
        <Link>
          <FontIcon
            aria-label="View"
            iconName="View"
            className={iconClass}
            onClick={() => setToggleTeachingBubbleVisible(true)}
            id="tutorialinfo"
          />
        </Link>
      </div>
      <div
        style={{
          marginBottom: 25,
          width: '75%',
          backgroundColor: 'white'
        }}
      >
        <Stack horizontal tokens={{ childrenGap: 5 }}>
          <PrimaryButton
            text="Save Grid"
            onClick={async () =>
              saveAction &&
              (await saveAction()
                .then((hasErrors) => {
                  if (hasErrors == false) alert('Grid Data Saved');
                })
                .catch((fatalErrors) => {
                  alert('Saving Action Crashed: ' + fatalErrors);
                }))
            }
          />
          <PrimaryButton
            text="Clear All Grid Messages"
            onClick={() => setClearGridMessages(true)}
          />
        </Stack>
        <EditableGrid
          enableSignleRowDeletionOnAddedRowsOnly={false}
          clearAllGridMessages={[clearGridMessages, setClearGridMessages]}
          enableSearchBox={gridConfigOptions.enableSearchBox}
          componentRef={detailsListRef}
          showASaveButtonInCommandbar={gridConfigOptions.showASaveButtonInCommandbar}
          enableEditAllOnCellClick={gridConfigOptions.enableEditAllOnCellClick}
          renameCommandBarItemsActions={{
            DeleteRow: 'Remove Row'
          }}
          customKeysToAddOnNewRow={[
            {
              key: 'customKey',
              defaultValue: 'random',
              ignoreKeyWhenDeterminingBlankRows: true,
              useKeyWhenDeterminingDuplicatedRows: true
            }
          ]}
          customOperationsKey={{
            colKey: 'operationType',
            options: {
              Add: 'Add',
              Delete: 'Delete',
              None: 'None',
              Update: 'Update'
            }
          }}
          onBeforeGridSave={(upd) => console.log('upd')}
          disableInlineCellEdit={gridConfigOptions.disableInlineCellEdit}
          enableInlineGridAdd={gridConfigOptions.enableInlineGridAdd}
          disableAllRowActions={gridConfigOptions.disableAllRowActions}
          id={100}
          gridLocation="Main Grid"
          checkboxVisibility={CheckboxVisibility.always}
          enableSaveGridOnCellValueChange={gridConfigOptions.enableSaveGridOnCellValueChange}
          GridSaveAction={(saveActionMethod) => setSaveAction(saveActionMethod)}
          enableMessageBarErrors={gridConfigOptions.enableMessageBarErrors}
          zeroRowsMsg={'This Rule Will Not Run'}
          commandBarStyles={{
            root: {
              borderWidth: '1px 1px 1px 1px',
              borderColor: 'rgba(0,0,0,0.35)',
              borderStyle: 'solid'
            }
          }}
          scrollablePaneStyles={{
            root: {
              borderWidth: '0px 1px 1px 0px',
              borderColor: 'rgba(0,0,0,0.35)',
              borderStyle: 'solid'
            },
            contentContainer: 'custom-scrollbar',
            stickyAbove: {
              selectors: {
                '.ms-FocusZone': {
                  paddingTop: 0
                }
              }
            }
          }}
          actionIconStylesInGrid={{ icon: { color: 'black' } }}
          enableColumnEdit={gridConfigOptions.enableColumnEdit}
          columns={attachGridValueChangeCallbacks(GridColumnConfig)}
          onRenderDetailsHeader={onRenderDetailsHeader}
          onRenderRow={onRenderRow}
          layoutMode={DetailsListLayoutMode.fixedColumns}
          selectionMode={SelectionMode.multiple}
          enableRowEditDelete={gridConfigOptions.enableRowEditDelete}
          enableRowEdit={gridConfigOptions.enableRowEdit}
          enableRowEditCancel={gridConfigOptions.enableRowEditCancel}
          enableBulkEdit={gridConfigOptions.enableBulkEdit}
          items={items}
          enableSingleCellEditOnDoubleClick={gridConfigOptions.enableSingleCellEditOnDoubleClick}
          enableCSVExport={gridConfigOptions.enableCSVExport}
          enableExcelImport={gridConfigOptions.enableExcelImport}
          enableExcelExport={gridConfigOptions.enableExcelExport}
          enableEditMode={gridConfigOptions.enableEditMode}
          enableEditModeCancel={gridConfigOptions.enableEditModeCancel}
          enableGridRowsDelete={gridConfigOptions.enableGridRowsDelete}
          enableGridRowsAdd={gridConfigOptions.enableGridRowsAdd}
          height={'250px'}
          width={'100%'}
          position={'relative'}
          onGridSave={onGridSave}
          enableGridReset={gridConfigOptions.enableGridReset}
          enableColumnFilters={gridConfigOptions.enableColumnFilters}
          enableColumnFilterRules={gridConfigOptions.enableColumnFilterRules}
          enableGridRowAddWithValues={{
            enable: gridConfigOptions.enableGridRowAddWithValues,
            addToGridButtonText: 'Add User',
            //onChange: checkForDup,
            onPreSubmit: checkForDup,
            addingToGridButtonText: 'Adding...',
            enableNonEditableColumns: false,
            showInsertedRowAtTopWhenAddedFromPanel: false
          }}
          gridCopyOptions={{
            enableGridCopy: gridConfigOptions.enableGridCopy,
            enableGridPaste: gridConfigOptions.enableGridPaste,
            enableSingleRowCopy: gridConfigOptions.enableSingleRowCopy
          }}
          onGridInErrorCallback={(isInError: boolean, msg: Map<string, string>) => {
            msg.forEach(function (value, key) {
              alert(value);
            });
          }}
          onGridUpdate={onGridUpdate}
          onGridFiltered={onGridFiltered}
          enableDefaultEditMode={gridConfigOptions.enableDefaultEditMode}
          customCommandBarItems={[
            {
              key: 'CustomCommandBarItem1',
              name: 'Custom Command Bar Item1',
              iconProps: { iconName: 'Download' },
              onClick: () => {
                alert('Clicked');
              }
            }
          ]}
        />
      </div>
      <Link aria-label="Privacy Statement URL" target="_blank" href={'www.msft.com'}>
        Microsoft Data Privacy Notice
      </Link>
      {/* {teachingBubbleVisible && (
        // <TeachingBubble
        //   target={teachingBubblePropsConfig?.config.target}
        //   primaryButtonProps={
        //     teachingBubblePropsConfig?.id < teachingBubbleConfig.length - 1
        //       ? nextBubbleProps
        //       : closeButtonProps
        //   }
        //   secondaryButtonProps={
        //     teachingBubblePropsConfig?.id > 0 ? previousBubbleProps : undefined
        //   }
        //   onDismiss={() => setToggleTeachingBubbleVisible(false)}
        //   footerContent={teachingBubblePropsConfig?.config.footerContent}
        //   headline={teachingBubblePropsConfig?.config.headline}
        //   hasCloseButton={true}
        //   isWide={
        //     teachingBubblePropsConfig?.config.isWide == null
        //       ? true
        //       : teachingBubblePropsConfig?.config.isWide
        //   }
        //   calloutProps={{
        //     directionalHint: DirectionalHint.bottomLeftEdge,
        //   }}
        // >
        //   {teachingBubblePropsConfig?.config.innerText}
        // </TeachingBubble>
      )} */}
    </Stack>
  );
};

export default Consumer;
