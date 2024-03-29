import {
  Checkbox,
  DatePicker,
  Dropdown,
  IComboBox,
  IComboBoxOption,
  IDropdownOption,
  ITag,
  Label,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Stack,
  Sticky,
  TextField
} from '@fluentui/react';
import { DayPickerStrings } from '../editablegrid/datepickerconfig';
import Select from 'react-select';

import {
  controlClass,
  horizontalGapStackTokens,
  verticalGapStackTokens
} from '../editablegrid/editablegridstyles';
import {
  GetDefault,
  IsValidDataType,
  ParseType,
  SelectComponentStyles,
  SelectComponentTheme,
  isArrayOfStrings,
  isValidDate
} from '../editablegrid/helper';
import PickerControl from '../editablegrid/pickercontrol/picker';
import {
  DepColTypes,
  DisableColTypes,
  IColumnConfig,
  IComboBoxOptionsMulit,
  IFilterDropdownOptions
} from '../types/columnconfigtype';
import { EditControlType } from '../types/editcontroltype';
import { createRef, useCallback, useEffect, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { isArray } from 'util';

interface Props {
  onSubmit: any;
  autoGenId: number;
  columnConfigurationData: IColumnConfig[];
  onChange?: any;
  preSubmitCallback?: any;
  addToGridButtonText?: string;
  addingToGridButtonText?: string;
  enableNonEditableColumns?: boolean;
}

const AddRowPanel = (props: Props) => {
  let AddSpinRef: any = createRef();

  const disableDropdown = useRef<Map<string, boolean>>(new Map());
  const disableComboBox = useRef<Map<string, boolean>>(new Map());
  const trackMulitSelect = useRef<null | any>(0);
  const _comboBoxRef = useRef<IComboBox>(null);

  const updateObj: any = {};
  const [columnValuesObj, setColumnValuesObj] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [confirmButtonText, setConfirmButtonText] = useState<string>('');
  const [confirmButtonDisabled, setConfirmButtonDisabled] = useState<boolean>(false);

  const GetValueOrDefault = (item: IColumnConfig) => {
    if (item.autoGenerate) {
      return props.autoGenId.toString();
    } else if (item.defaultOnAddRow) {
      if (item.comboBoxOptions) {
        return (
          item.comboBoxOptions?.filter((x) => x.text == item.defaultOnAddRow)[0]?.text ??
          item.comboBoxOptions
            ?.filter((x) => x.key?.toString() == item.defaultOnAddRow)[0]
            ?.text?.toString() ??
          item.defaultOnAddRow
        );
      } else if (item.dropdownValues) {
        return (
          item.dropdownValues?.filter((x) => x.text == item.defaultOnAddRow)[0]?.text ??
          item.dropdownValues
            ?.filter((x) => x.key?.toString() == item.defaultOnAddRow)[0]
            ?.text?.toString() ??
          item.defaultOnAddRow
        );
      }
      return item.defaultOnAddRow;
    }
    return GetDefault(item.dataType);
  };

  useEffect(() => {
    let tmpColumnValuesObj: any = {};
    props.columnConfigurationData.forEach((item, index) => {
      tmpColumnValuesObj[item.key] = {
        value: GetValueOrDefault(item),
        isChanged: false,
        error: null,
        defaultValueOnNewRow: item?.defaultOnAddRow ?? null,
        dataType: item.dataType,
        multiSelect: item.comboBoxProps?.multiSelect ?? false,
        columnEditable: item?.editable ?? false
      };
    });
    setColumnValuesObj(tmpColumnValuesObj);
    setConfirmButtonText(props.addToGridButtonText ?? 'Save To Grid');
  }, [props.columnConfigurationData]);

  const SetObjValues = (
    key: string,
    value: any,
    isChanged: boolean = true,
    errorMessage: string | null = null,
    multiSelect = false
  ): void => {
    if (error) setError('');

    var columnValuesObjTmp = { ...columnValuesObj };

    columnValuesObjTmp[key] = {
      ...columnValuesObjTmp[key],
      value: value,
      isChanged: isChanged,
      error: errorMessage
    };

    if (props.onChange) {
      var changed = props.onChange(Object.assign({}, columnValuesObjTmp));
      if (changed?.errorMessage !== undefined) {
        setError(changed.errorMessage.trim());
      }

      if (changed?.data) {
        var objectKeys = Object.keys(changed.data);
        objectKeys.forEach((objKey) => {
          columnValuesObjTmp[objKey]['value'] = changed['data'][objKey]['value'];
        });
      }
    }
    setColumnValuesObj(columnValuesObjTmp);
  };

  const onDropDownChange = (
    event: React.FormEvent<HTMLDivElement>,
    selectedDropdownItem: IDropdownOption | undefined,
    item: any
  ): void => {
    SetObjValues(item.key, selectedDropdownItem?.key);
  };

  const onComboBoxChange = (
    event: React.FormEvent<IComboBox> | undefined,
    selectedOption: IComboBoxOptionsMulit | undefined,
    item: any
  ): void => {
    SetObjValues(
      item.key,
      item?.comboBoxProps?.multiSelect ? selectedOption : selectedOption?.key,
      true,
      null,
      item?.comboBoxProps?.multiSelect ?? false
    );
  };

  const onComboBoxChangeMultiSelect = (selectedOptions: any, item: any): void => {
    SetObjValues(item.key, selectedOptions);
  };

  const onCheckBoxChange = (
    ev: React.FormEvent<HTMLElement | HTMLInputElement> | undefined,
    isChecked: boolean,
    item: any
  ): void => {
    SetObjValues(item.key, isChecked ?? false);
  };

  const onTextUpdate = (
    ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    text: string,
    column: IColumnConfig
  ): void => {
    if (!IsValidDataType(column.dataType, text)) {
      SetObjValues(
        (ev.target as Element).id,
        text,
        false,
        `Data should be of type '${column.dataType}'`
      );
      return;
    }

    SetObjValues((ev.target as Element).id, ParseType(column.dataType, text));
  };

  const onNumericFormatUpdate = (
    ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    text: string,
    column: IColumnConfig
  ): void => {
    if (!IsValidDataType(column.dataType, text)) {
      SetObjValues(
        (ev?.target as Element).id,
        text?.toString() ?? '0',
        false,
        `Data should be of type '${column.dataType}'`
      );
      return;
    }

    SetObjValues((ev?.target as Element).id, ParseType(column.dataType, text?.toString() ?? '0'));
  };

  const Messages = useRef<Map<string, { msg: string; type: MessageBarType }>>(new Map());

  const [messagesState, setMessagesState] = useState<Map<string, any>>(new Map());
  const [messagesJSXState, setMessagesJSXState] = useState<JSX.Element[]>([]);

  const insertToMessageMap = (mapVar: Map<any, any>, key: any, value: any) => {
    mapVar.set(key, value);
    const newMap = new Map(mapVar);
    setMessagesState(newMap);
  };

  const removeFromMessageMap = (mapVar: Map<any, any>, key: any) => {
    mapVar.delete(key);
    const newMap = new Map(mapVar);
    setMessagesState(newMap);
  };

  const onRenderMsg = useCallback(() => {
    let messageTmp: JSX.Element[] = [];

    messagesState.forEach(function (value, key) {
      messageTmp.push(
        <MessageBar
          styles={{ root: { marginBottom: 5 } }}
          key={key}
          messageBarType={value.type}
          onDismiss={() => removeFromMessageMap(Messages.current, key)}
        >
          {value.msg}
        </MessageBar>
      );
    });
    return messageTmp;
  }, [messagesState]);

  useEffect(() => {
    Messages.current = messagesState;
    setMessagesJSXState(onRenderMsg());
  }, [messagesState]);

  const runGridValidations = (): boolean => {
    let localError = false;
    let emptyCol: string[] = [];
    let emptyReqCol: string[] = [];
    Messages.current = new Map();
    setMessagesState(Messages.current);
    props.columnConfigurationData.forEach((item, row) => {
      const currentValue = columnValuesObj[item.key].value ?? null;
      const getValue = (key: string): string => columnValuesObj[key]?.value;
      const currentCol = props.columnConfigurationData.filter((x) => x.key === item.key);

      // ValidDataTypeCheck
      if (
        item.required &&
        typeof item.required == 'boolean' &&
        (currentValue == null ||
          currentValue == undefined ||
          currentValue?.toString().length <= 0 ||
          (currentValue == '' && item.dataType != 'number'))
      ) {
        if (!emptyCol.includes(' ' + item.name)) emptyCol.push(' ' + item.name);
      } else if (
        typeof item.required !== 'boolean' &&
        !item.required.requiredOnlyIfTheseColumnsAreEmpty &&
        item.required.errorMessage &&
        (currentValue == null ||
          currentValue == undefined ||
          currentValue?.toString().length <= 0 ||
          (currentValue == '' && item.dataType != 'number'))
      ) {
        var msg = `${item.name}: ${item.required.errorMessage}.`;
        insertToMessageMap(Messages.current, item.key + row + 'empty', {
          msg: msg,
          type: MessageBarType.error
        });
      } else if (
        typeof item.required !== 'boolean' &&
        item.required.requiredOnlyIfTheseColumnsAreEmpty &&
        (currentValue == null ||
          currentValue == undefined ||
          currentValue?.toString().length <= 0 ||
          (currentValue == '' && item.dataType != 'number'))
      ) {
        const checkKeys = item.required.requiredOnlyIfTheseColumnsAreEmpty.colKeys;
        let skippable = false;
        for (let index = 0; index < checkKeys.length; index++) {
          const columnKey = checkKeys[index];
          const str = getValue(columnKey);

          if (item.required.alwaysRequired) {
            if (
              str == null ||
              str == undefined ||
              str?.toString().length <= 0 ||
              (str == '' && item.dataType != 'number')
            ) {
              if (item.required.errorMessage) {
                var msg = `${item.name}: ${item.required.errorMessage}.`;
                insertToMessageMap(Messages.current, item.key + row + 'empty', {
                  msg: msg,
                  type: MessageBarType.error
                });
              } else if (!emptyReqCol.includes(' ' + item.name)) {
                emptyReqCol.push(' ' + item.name);
                break;
              }
            }
          } else {
            if ((str || str?.toString().trim() == '0') && str?.toString().length > 0) {
              skippable = true;
              break;
            }
          }
        }
        if (!emptyReqCol.includes(' ' + item.name) && skippable == false) {
          if (item.required.errorMessage == undefined) {
            emptyReqCol.push(' ' + item.name);
          } else {
            var msg = `${item.name}: ${item.required.errorMessage}.`;
            insertToMessageMap(Messages.current, item.key + row + 'empty', {
              msg: msg,
              type: MessageBarType.error
            });
          }
        }
      }

      if (
        currentValue !== null &&
        (typeof currentValue !== item.dataType || typeof currentValue === 'number')
      ) {
        if (item.dataType === 'number') {
          if (currentValue && isNaN(parseInt(currentValue)) && currentValue !== '') {
            var msg = `Column ${item.name}: Value is not a '${item.dataType}'.`;

            insertToMessageMap(Messages.current, item.key + row, {
              msg: msg,
              type: MessageBarType.error
            });

            localError = true;
          } else if (item.validations && item.validations.numberBoundaries) {
            const min = item.validations.numberBoundaries.minRange;
            const max = item.validations.numberBoundaries.maxRange;

            if (min && max) {
              if (!(min <= parseInt(currentValue) && max >= parseInt(currentValue))) {
                var msg = `Column ${item.name}: Value outside of range '${min} - ${max}'. Entered value ${currentValue}.`;

                insertToMessageMap(Messages.current, item.key + row, {
                  msg: msg,
                  type: MessageBarType.error
                });

                localError = true;
              }
            } else if (min) {
              if (!(min <= parseInt(currentValue))) {
                var msg = `Column ${item.name}: Value is lower than required range: '${min}'. Entered value ${currentValue}.`;

                insertToMessageMap(Messages.current, item.key + row, {
                  msg: msg,
                  type: MessageBarType.error
                });

                localError = true;
              }
            } else if (max) {
              if (!(max >= parseInt(currentValue))) {
                var msg = `Column ${item.name}: Value is greater than required range: '${max}'. Entered value ${currentValue}.`;

                insertToMessageMap(Messages.current, item.key + row, {
                  msg: msg,
                  type: MessageBarType.error
                });

                localError = true;
              }
            }
          }
        } else if (item.dataType === 'boolean') {
          try {
            Boolean(currentValue);
          } catch (error) {
            var msg = `Column ${item.name}: Value is not a '${item.dataType}'.`;

            insertToMessageMap(Messages.current, item.key + row, {
              msg: msg,
              type: MessageBarType.error
            });

            localError = true;
          }
        } else if (item.dataType === 'date') {
          try {
            if (!isValidDate(currentValue)) {
              throw {};
            }
          } catch (error) {
            var msg = `Column ${item.name}: Value is not a '${item.dataType}'.`;

            insertToMessageMap(Messages.current, item.key + row, {
              msg: msg,
              type: MessageBarType.error
            });

            localError = true;
          }
        }
      }

      if (item.validations && item.validations.columnDependent) {
        for (let index = 0; index < item.validations.columnDependent.length; index++) {
          const colDep = item.validations.columnDependent[index];

          if (
            getValue(colDep.dependentColumnKey) ||
            getValue(colDep.dependentColumnKey) !== undefined
          ) {
            const str = getValue(colDep.dependentColumnKey);
            let skip = false;

            if (
              colDep.skipCheckIfTheseColumnsHaveData &&
              colDep.skipCheckIfTheseColumnsHaveData.colKeys
            ) {
              for (const skipForKey of colDep.skipCheckIfTheseColumnsHaveData.colKeys) {
                if (colDep.skipCheckIfTheseColumnsHaveData?.partial) {
                  const str = getValue(skipForKey);
                  if (str && str !== null && str !== undefined && str?.toString().length > 0) {
                    skip = true;
                    break;
                  }
                } else {
                  const str = getValue(skipForKey);
                  if (str && str !== null && str !== undefined && str?.toString().length > 0) {
                    skip = true;
                  } else {
                    skip = false;
                    break;
                  }
                }
              }
            }

            if (!skip) {
              if (str !== undefined && str !== null) {
                if (str?.toString().length > 0 && colDep.type === DepColTypes.MustBeEmpty) {
                  if (currentValue !== null && currentValue?.toString().length > 0) {
                    var msg = `Column ${item.name}: ${
                      colDep.errorMessage ??
                      `Data cannot be entered in ${item.name} and in ${colDep.dependentColumnName} Column. Remove data in ${colDep.dependentColumnName} Column to enter data here.`
                    }`;

                    insertToMessageMap(Messages.current, row + 'ColDep', {
                      msg: msg,
                      type: MessageBarType.error
                    });

                    localError = true;
                  }
                }
              }
              if (
                (str == undefined ||
                  str == null ||
                  (str == '' && item.dataType != 'number') ||
                  (str && str?.toString().length <= 0)) &&
                colDep.type === DepColTypes.MustHaveData
              ) {
                var msg = `Column ${item.name}: ${
                  colDep.errorMessage ??
                  `Data needs to be entered in ${item.name} and in ${colDep.dependentColumnName} Column.`
                }`;

                insertToMessageMap(Messages.current, row + 'ColDep', {
                  msg: msg,
                  type: MessageBarType.error
                });
                localError = true;
              }
            }
          }
        }
      }

      if (item.validations && item.validations.regexValidation) {
        for (let index = 0; index < item.validations.regexValidation.length; index++) {
          const data = item.validations.regexValidation[index];
          if (!data.regex.test(currentValue)) {
            var msg = `Column ${item.name}: ${data.errorMessage}`;

            insertToMessageMap(Messages.current, item.key + row, {
              msg: msg,
              type: MessageBarType.error
            });

            localError = true;
          }
        }
      }

      if (item.validations && item.validations.stringValidations) {
        const caseInsensitive = item.validations.stringValidations.caseInsensitive;
        if (caseInsensitive) {
          if (
            currentValue !== null &&
            item.validations.stringValidations?.conditionCantEqual?.toLowerCase() ===
              currentValue?.toString().toLowerCase()
          ) {
            var msg = `Column ${item.name}: ${item.validations.stringValidations?.errMsg}`;

            insertToMessageMap(Messages.current, item.key + row, {
              msg: msg,
              type: MessageBarType.error
            });

            localError = true;
          } else {
            if (
              currentValue !== null &&
              item.validations.stringValidations?.conditionCantEqual === currentValue?.toString()
            ) {
              var msg = `Column ${item.name}: ${item.validations.stringValidations?.errMsg}`;

              insertToMessageMap(Messages.current, item.key + row, {
                msg: msg,
                type: MessageBarType.error
              });

              localError = true;
            }
          }
        }
      }
    });

    if (emptyReqCol.length > 1) {
      var msg = `Notice: ${emptyReqCol} cannot all be empty`;

      insertToMessageMap(Messages.current, -99 + 'erc', {
        msg: msg,
        type: MessageBarType.error
      });

      localError = true;
    } else if (emptyReqCol.length == 1) {
      var msg = `Notice: ${emptyReqCol} cannot all be empty`;

      insertToMessageMap(Messages.current, -99 + 'erc', {
        msg: msg,
        type: MessageBarType.error
      });

      localError = true;
    }

    if (emptyCol.length > 1) {
      var msg = `Notice: ${emptyCol?.toString()} cannot be empty at all`;

      insertToMessageMap(Messages.current, -999 + 'ec', {
        msg: msg,
        type: MessageBarType.error
      });

      localError = true;
    } else if (emptyCol.length == 1) {
      var msg = `Notice: ${emptyCol?.toString()} cannot be empty`;

      insertToMessageMap(Messages.current, -999 + 'ec', {
        msg: msg,
        type: MessageBarType.error
      });

      localError = true;
    }

    return localError;
  };

  function generateCombinations(
    obj: any,
    currentCombination: any,
    keys: string[],
    output: string[][]
  ) {
    if (keys.length === 0) {
      output.push(currentCombination);
      return;
    }

    var currentKey = keys[0];
    var remainingKeys = keys.slice(1);

    if (Array.isArray(obj[currentKey]) == false) {
      obj[currentKey] = [obj[currentKey]];
    }
    obj[currentKey].forEach(function (value: any) {
      generateCombinations(
        obj,
        currentCombination.concat([[currentKey, value]]),
        remainingKeys,
        output
      );
    });
  }

  function generateAllCombinations(data: any) {
    var keys = Object.keys(data);
    var output: any = [];
    generateCombinations(data, [], keys, output);
    return output;
  }

  const onPanelSubmit = async (): Promise<void> => {
    var columnValuesObjTmp = { ...columnValuesObj };
    setError('');

    const submitAndClose = () => {
      var objectKeys = Object.keys(columnValuesObj);
      objectKeys.forEach((objKey) => {
        if (columnValuesObj[objKey]['isChanged']) {
          if (columnValuesObj[objKey]['multiSelect'] == true) {
            updateObj[objKey] = columnValuesObj[objKey]['value'].map(
              (obj: any) => obj?.key ?? null
            );
          } else {
            updateObj[objKey] = columnValuesObj[objKey]['value'];
          }
        }
      });

      var combinations = generateAllCombinations(updateObj);
      props.onSubmit(combinations);

      // combinations.forEach(function (combination: any, index: number) {
      //   const post = Object.fromEntries(combinations[index])
      //   console.log(post)
      // });
    };

    if (props.preSubmitCallback) {
      setConfirmButtonDisabled(true);
      if (props.addingToGridButtonText?.trim()) {
        setConfirmButtonText(props.addingToGridButtonText);
      }

      props.preSubmitCallback(Object.assign({}, columnValuesObjTmp)).then((changed: any) => {
        if (changed?.errorMessage !== undefined) {
          setError(changed.errorMessage.trim());
        }

        setConfirmButtonText(props.addToGridButtonText ?? 'Save To Grid');
        setConfirmButtonDisabled(false);

        if (changed?.errorMessage?.trim()?.length > 0) {
          setColumnValuesObj(columnValuesObjTmp);
          return;
        }

        if (changed?.data) {
          var objectKeys = Object.keys(changed.data);
          if (objectKeys)
            objectKeys.forEach((objKey) => {
              columnValuesObjTmp[objKey]['value'] = changed['data'][objKey]['value'];
            });
        }

        const hasErrors = runGridValidations();
        if (!hasErrors && error == '') submitAndClose();
      });
    } else {
      const hasErrors = runGridValidations();
      if (!hasErrors) submitAndClose();
    }
  };
  const onCellPickerTagListChanged = (cellPickerTagList: ITag[] | undefined, item: any): void => {
    if (cellPickerTagList && cellPickerTagList[0] && cellPickerTagList[0].name)
      SetObjValues(item.key, cellPickerTagList[0].name);
    else SetObjValues(item.key, '');
  };

  const onCellDateChange = (date: Date | null | undefined, item: any): void => {
    SetObjValues(item.key, date);
  };

  const filterMultiSelectOptions = (options: IFilterDropdownOptions[], item: any) => {
    const filtered = options.filter((x, index) => {
      return (
        x.correspondingKey ==
        columnValuesObj[item.filterDropdownOptions?.filterBasedOnThisColumnKey ?? ''].value
      );
    });

    if (
      typeof columnValuesObj[item.key].value == 'object' &&
      JSON.stringify(trackMulitSelect.current) != JSON.stringify(filtered)
    ) {
      const keysCurrentlySelected = new Set(
        columnValuesObj?.[item.key].value?.map((item: any) => item?.key ?? null)
      );

      const filteredKeys = filtered.filter((item) => keysCurrentlySelected.has(item?.key));

      trackMulitSelect.current = filtered;
      onComboBoxChangeMultiSelect(filteredKeys.length == 0 ? [null] : filteredKeys, item);
    }
    8;
    return filtered.map((item, index) => {
      return { value: item.key, label: item.text };
    });
  };

  const createTextFields = (): any[] => {
    let tmpRenderObj: any[] = [];
    props.columnConfigurationData.forEach((item, rowNum) => {
      switch (item.inputType) {
        case EditControlType.CheckBox:
          tmpRenderObj.push(
            <Checkbox
              disabled={(!item.editable && !props.enableNonEditableColumns) ?? true}
              checked={columnValuesObj[item.key].value}
              key={item.key}
              label={item.text}
              onChange={(ev, isChecked) => {
                onCheckBoxChange(ev, isChecked ?? false, item);
              }}
            />
          );
          break;
        case EditControlType.Date:
          tmpRenderObj.push(
            <DatePicker
              key={item.key}
              disabled={(!item.editable && !props.enableNonEditableColumns) ?? true}
              defaultValue={columnValuesObj[item.key].value}
              label={item.text}
              strings={DayPickerStrings}
              placeholder="Select a date..."
              ariaLabel="Select a date"
              onSelectDate={(date) => onCellDateChange(date, item)}
            />
          );
          break;
        case EditControlType.ComboBox:
          if (item.disableComboBox && typeof item.disableComboBox !== 'boolean') {
            let newMap = new Map(disableComboBox.current);
            for (let index = 0; index < [item.disableComboBox].length; index++) {
              const disableCellOptions = [item.disableComboBox][index];
              const str = columnValuesObj[disableCellOptions.disableBasedOnThisColumnKey].value;

              if (disableCellOptions.type === DisableColTypes.DisableWhenColKeyHasData) {
                if (
                  str &&
                  str?.toString().length > 0 &&
                  (newMap.get(item.key + rowNum) ?? false) === false
                ) {
                  newMap.set(item.key + rowNum, true);
                  disableComboBox.current = newMap;
                } else if (newMap.get(item.key + rowNum) == true && !str) {
                  newMap.set(item.key + rowNum, false);
                  disableComboBox.current = newMap;
                }
              } else if (disableCellOptions.type === DisableColTypes.DisableWhenColKeyIsEmpty) {
                if (str == '' || (str && str?.toString().length <= 0)) {
                  newMap.set(item.key + rowNum, true);
                } else if (
                  (str === null || str === undefined) &&
                  (newMap.get(item.key + rowNum) ?? false) === false
                ) {
                  newMap.set(item.key + rowNum, true);
                } else if (
                  (newMap.get(item.key + rowNum) ?? true) !== false &&
                  str &&
                  str?.toString().length > 0
                ) {
                  newMap.set(item.key + rowNum, false);
                }
              }
            }
            disableComboBox.current = newMap;
          }
          if (item.comboBoxProps?.multiSelect) {
            tmpRenderObj.push(
              <Stack grow>
                <Label style={{ marginBottom: -5 }}>{item.text}</Label>
                <Select
                  menuPlacement="auto"
                  menuPosition="fixed"
                  key={`${item.key}_${
                    item?.filterDropdownOptions?.filterOptions
                      ?.filter(
                        (x) =>
                          x.correspondingKey ==
                          columnValuesObj[
                            item.filterDropdownOptions?.filterBasedOnThisColumnKey ?? ''
                          ].value
                      )
                      ?.toString() ?? 'NT'
                  }`}
                  aria-label={item.text}
                  filterOption={
                    item.comboBoxProps?.searchType == 'startswith'
                      ? (option, inputValue) =>
                          option.label?.toLowerCase()?.startsWith(inputValue?.toLowerCase())
                      : undefined
                  }
                  placeholder={item.comboBoxProps?.placeholder ?? 'Select Options'}
                  tabSelectsValue={false}
                  noOptionsMessage={
                    item.comboBoxProps?.noOptionsFoundMessage
                      ? () => item.comboBoxProps?.noOptionsFoundMessage
                      : undefined
                  }
                  isDisabled={
                    disableComboBox.current.get(item.key + rowNum) ??
                    (typeof item.disableComboBox == 'boolean'
                      ? item.disableComboBox
                      : (!item.editable && !props.enableNonEditableColumns) ?? false)
                  }
                  isMulti
                  isClearable
                  escapeClearsValue
                  openMenuOnFocus
                  options={
                    item.filterDropdownOptions
                      ? filterMultiSelectOptions(item.filterDropdownOptions.filterOptions, item)
                      : item.comboBoxOptions
                        ? item.comboBoxOptions.map((item) => {
                            return { value: item.key, label: item.text };
                          })
                        : []
                  }
                  hideSelectedOptions
                  onChange={(options, av) => {
                    onComboBoxChangeMultiSelect(
                      options
                        ? options.map((item) => {
                            return { key: item.value, text: item.label };
                          })
                        : [],
                      item
                    );
                  }}
                  theme={SelectComponentTheme}
                  styles={SelectComponentStyles}
                />
              </Stack>
            );
          } else {
            tmpRenderObj.push(
              <>
                <Label style={{ marginBottom: -5 }}>{item.text}</Label>
                <Select
                  menuPlacement="auto"
                  menuPosition="fixed"
                  key={item.key}
                  aria-label={item.text}
                  filterOption={
                    item.comboBoxProps?.searchType == 'startswith'
                      ? (option, inputValue) =>
                          option.label?.toLowerCase()?.startsWith(inputValue?.toLowerCase())
                      : undefined
                  }
                  placeholder={item.comboBoxProps?.placeholder ?? 'Select Option'}
                  tabSelectsValue={false}
                  noOptionsMessage={
                    item.comboBoxProps?.noOptionsFoundMessage
                      ? () => item.comboBoxProps?.noOptionsFoundMessage
                      : undefined
                  }
                  isDisabled={
                    disableComboBox.current.get(item.key + rowNum) ??
                    (typeof item.disableComboBox == 'boolean'
                      ? item.disableComboBox
                      : (!item.editable && !props.enableNonEditableColumns) ?? false)
                  }
                  isClearable
                  escapeClearsValue
                  openMenuOnFocus
                  options={
                    item.comboBoxOptions
                      ?.map((itm) => {
                        return { value: itm.key, label: itm.text };
                      })
                      ?.concat({ value: '', label: '' }) ?? []
                  }
                  hideSelectedOptions
                  onChange={(options, av) => {
                    const option = options as {
                      value: string | number;
                      label: string;
                    };

                    let convertOption: IComboBoxOption = { key: '', text: '' };

                    if (options) convertOption = { key: option.value, text: option.label };

                    onComboBoxChange(undefined, convertOption, item);
                  }}
                  theme={SelectComponentTheme}
                  styles={SelectComponentStyles}
                />
              </>
            );
          }

          break;
        case EditControlType.DropDown:
          if (item.disableDropdown && typeof item.disableDropdown !== 'boolean') {
            let newMap = new Map(disableDropdown.current);
            for (let index = 0; index < [item.disableDropdown].length; index++) {
              const disableCellOptions = [item.disableDropdown][index];
              const str = columnValuesObj[disableCellOptions.disableBasedOnThisColumnKey].value;

              if (disableCellOptions.type === DisableColTypes.DisableWhenColKeyHasData) {
                if (
                  str &&
                  str?.toString().length > 0 &&
                  (newMap.get(item.key + rowNum) ?? false) === false
                ) {
                  newMap.set(item.key + rowNum, true);
                  disableDropdown.current = newMap;
                } else if (newMap.get(item.key + rowNum) == true && !str) {
                  newMap.set(item.key + rowNum, false);
                  disableDropdown.current = newMap;
                }
              } else if (disableCellOptions.type === DisableColTypes.DisableWhenColKeyIsEmpty) {
                if (str == '' || (str && str?.toString().length <= 0)) {
                  newMap.set(item.key + rowNum, true);
                } else if (
                  (str === null || str === undefined) &&
                  (newMap.get(item.key + rowNum) ?? false) === false
                ) {
                  newMap.set(item.key + rowNum, true);
                } else if (
                  (newMap.get(item.key + rowNum) ?? true) !== false &&
                  str &&
                  str?.toString().length > 0
                ) {
                  newMap.set(item.key + rowNum, false);
                }
              }
            }
            disableDropdown.current = newMap;
          }
          tmpRenderObj.push(
            <Dropdown
              key={item.key}
              ariaLabel={item.key}
              placeholder={
                (item.filterDropdownOptions
                  ? item.filterDropdownOptions.filterOptions.filter((x) => x.text == item.key)[0]
                      ?.text
                  : item.dropdownValues?.filter((x) => x.text == item.key)[0]?.text) ??
                'Select an option'
              }
              selectedKey={
                // Keys Select Text
                item.filterDropdownOptions
                  ? item.filterDropdownOptions.filterOptions
                      ?.filter(
                        (x) =>
                          (x?.key == columnValuesObj[item.key].value &&
                            x.correspondingKey ==
                              columnValuesObj[
                                item.filterDropdownOptions?.filterBasedOnThisColumnKey ?? ''
                              ].value) ??
                          item.key
                      )[0]
                      ?.key?.toString() ??
                    item.filterDropdownOptions.filterOptions
                      ?.filter(
                        (x) =>
                          (x?.text == columnValuesObj[item.key].value &&
                            x.correspondingKey ==
                              columnValuesObj[
                                item.filterDropdownOptions?.filterBasedOnThisColumnKey ?? ''
                              ].value) ??
                          item.key
                      )[0]
                      ?.key?.toString() ??
                    null
                  : item.dropdownValues
                      ?.filter((x) => x?.key == columnValuesObj[item.key].value ?? item.key)[0]
                      ?.key?.toString() ??
                    item.dropdownValues
                      ?.filter((x) => x?.text == columnValuesObj[item.key].value ?? item.key)[0]
                      ?.key?.toString() ??
                    null
              }
              label={item.text}
              options={
                item.filterDropdownOptions
                  ? item.filterDropdownOptions.filterOptions.filter(
                      (x) =>
                        x.correspondingKey ==
                        columnValuesObj[
                          item.filterDropdownOptions?.filterBasedOnThisColumnKey ?? ''
                        ].value
                    )
                  : item.dropdownValues ?? []
              }
              onChange={(ev, selected) => onDropDownChange(ev, selected, item)}
              disabled={
                disableDropdown.current.get(item.key + rowNum) ??
                (typeof item.disableDropdown == 'boolean'
                  ? item.disableDropdown
                  : (!item.editable && !props.enableNonEditableColumns) ?? false)
              }
            />
          );
          break;
        case EditControlType.Picker:
          tmpRenderObj.push(
            <div key={item.key}>
              <span className={controlClass.pickerLabel}>{item.text}</span>
              <PickerControl
                defaultTags={
                  typeof item.defaultOnAddRow == 'string'
                    ? [item.defaultOnAddRow]
                    : isArrayOfStrings(item.defaultOnAddRow)
                      ? (item.defaultOnAddRow as string[])
                      : undefined
                }
                arialabel={item.text}
                selectedItemsLimit={1}
                pickerTags={item.pickerOptions?.pickerTags ?? []}
                minCharLimitForSuggestions={2}
                onTaglistChanged={(selectedItem: ITag[] | undefined) => {
                  if ((item.editable || props.enableNonEditableColumns) == true)
                    onCellPickerTagListChanged(selectedItem, item);
                }}
                pickerDescriptionOptions={item.pickerOptions?.pickerDescriptionOptions}
              />
            </div>
          );
          break;
        case EditControlType.MultilineTextField:
          tmpRenderObj.push(
            <TextField
              key={item.key}
              disabled={(!item.editable && !props.enableNonEditableColumns) ?? true}
              errorMessage={columnValuesObj[item.key].error}
              name={item.text}
              multiline={true}
              rows={1}
              id={item.key}
              label={item.text}
              onChange={(ev, text) => onTextUpdate(ev, text!, item)}
              defaultValue={columnValuesObj[item.key].value ?? undefined}
            />
          );
          break;
        case EditControlType.Password:
          tmpRenderObj.push(
            <TextField
              key={item.key}
              disabled={(!item.editable && !props.enableNonEditableColumns) ?? true}
              errorMessage={columnValuesObj[item.key].error}
              name={item.text}
              id={item.key}
              label={item.text}
              onChange={(ev, text) => onTextUpdate(ev, text!, item)}
              defaultValue={columnValuesObj[item.key].value ?? undefined}
              type="password"
              canRevealPassword
            />
          );
          break;
        case EditControlType.NumericFormat:
          tmpRenderObj.push(
            <NumericFormat
              key={item.key}
              id={item.key}
              disabled={(!item.editable && !props.enableNonEditableColumns) ?? true}
              defaultValue={columnValuesObj[item.key]?.value?.toString() ?? ''}
              placeholder={item.validations?.numericFormatProps?.formatBase?.placeholder}
              valueIsNumericString={
                item.validations?.numericFormatProps?.formatBase?.valueIsNumericString
              }
              type={item.validations?.numericFormatProps?.formatBase?.type}
              inputMode={item.validations?.numericFormatProps?.formatBase?.inputMode}
              renderText={item.validations?.numericFormatProps?.formatBase?.renderText}
              label={item.validations?.numericFormatProps?.label ?? item.text}
              decimalScale={item.validations?.numericFormatProps?.formatProps?.decimalScale}
              fixedDecimalScale={
                item.validations?.numericFormatProps?.formatProps?.fixedDecimalScale
              }
              decimalSeparator={item.validations?.numericFormatProps?.formatProps?.decimalSeparator}
              allowedDecimalSeparators={
                item.validations?.numericFormatProps?.formatProps?.allowedDecimalSeparators
              }
              thousandsGroupStyle={
                item.validations?.numericFormatProps?.formatProps?.thousandsGroupStyle
              }
              thousandSeparator={
                item.validations?.numericFormatProps?.formatProps?.thousandSeparator
              }
              onRenderLabel={item.validations?.numericFormatProps?.onRenderLabel}
              ariaLabel={item.validations?.numericFormatProps?.ariaLabel ?? item.text}
              customInput={TextField}
              suffix={item.validations?.numericFormatProps?.formatProps?.suffix}
              prefix={item.validations?.numericFormatProps?.formatProps?.prefix}
              allowLeadingZeros={
                item.validations?.numericFormatProps?.formatProps?.allowLeadingZeros
              }
              allowNegative={item.validations?.numericFormatProps?.formatProps?.allowNegative}
              isAllowed={item.validations?.numericFormatProps?.formatBase?.isAllowed}
              onValueChange={(values, sourceInfo) => {
                if (sourceInfo.source == 'event')
                  onNumericFormatUpdate(sourceInfo.event as any, values.value, item);
              }}
            />
          );
          break;
        default:
          if (item.autoGenerate) {
            tmpRenderObj.push(
              <TextField
                key={item.key}
                errorMessage={columnValuesObj[item.key].error}
                name={item.text}
                id={item.key}
                label={item.text}
                value={columnValuesObj[item.key].value ?? undefined}
                readOnly
                disabled
              />
            );
          } else {
            tmpRenderObj.push(
              <TextField
                key={item.key}
                disabled={(!item.editable && !props.enableNonEditableColumns) ?? true}
                defaultValue={columnValuesObj[item.key].value ?? undefined}
                errorMessage={columnValuesObj[item.key].error}
                name={item.text}
                id={item.key}
                label={item.text}
                onChange={(ev, text) => onTextUpdate(ev, text!, item)}
              />
            );
          }

          break;
      }
    });

    return tmpRenderObj;
  };

  return (
    <Stack grow style={{ height: '100%' }}>
      {error && (
        <MessageBar
          styles={{ root: { marginBottom: 5 } }}
          messageBarType={MessageBarType.error}
          onDismiss={() => setError('')}
        >
          {error}
        </MessageBar>
      )}
      <div style={{ marginBottom: 15 }}>
        <Sticky>{messagesJSXState.map((element) => element)}</Sticky>
      </div>
      <Stack grow tokens={verticalGapStackTokens}>
        {columnValuesObj && createTextFields()}
      </Stack>
      <Stack horizontal tokens={horizontalGapStackTokens}>
        <PrimaryButton
          text={confirmButtonText}
          className={controlClass.submitStylesEditpanel}
          onClick={onPanelSubmit}
          allowDisabledFocus
          disabled={
            confirmButtonDisabled ||
            error ||
            (columnValuesObj &&
              Object.keys(columnValuesObj).some(
                (k) =>
                  columnValuesObj[k] &&
                  columnValuesObj[k].error &&
                  columnValuesObj[k].error.length > 0
              )) ||
            false
          }
        />
      </Stack>
    </Stack>
  );
};

export default AddRowPanel;
