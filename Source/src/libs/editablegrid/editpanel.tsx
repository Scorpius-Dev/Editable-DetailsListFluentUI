// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Checkbox,
  DatePicker,
  Dropdown,
  IComboBox,
  IComboBoxOption,
  IDropdownOption,
  ITag,
  Label,
  PrimaryButton,
  Stack,
  TextField
} from '@fluentui/react';
import { DayPickerStrings } from '../editablegrid/datepickerconfig';
import {
  controlClass,
  horizontalGapStackTokens,
  stackStyles,
  textFieldStyles,
  verticalGapStackTokens
} from '../editablegrid/editablegridstyles';
import {
  GetDefault,
  IsValidDataType,
  ParseType,
  SelectComponentStyles,
  SelectComponentTheme
} from '../editablegrid/helper';
import PickerControl from '../editablegrid/pickercontrol/picker';
import { IColumnConfig } from '../types/columnconfigtype';
import { EditControlType } from '../types/editcontroltype';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import Select from 'react-select';

interface Props {
  onChange: any;
  columnConfigurationData: IColumnConfig[];
}

const EditPanel = (props: Props) => {
  const updateObj: any = {};
  const [columnValuesObj, setColumnValuesObj] = useState<any>(null);

  useEffect(() => {
    let tmpColumnValuesObj: any = {};
    props.columnConfigurationData
      .filter((x) => x.editable == true)
      .forEach((item, index) => {
        tmpColumnValuesObj[item.key] = {
          value: GetDefault(item.dataType),
          isChanged: false,
          error: null
        };
      });
    setColumnValuesObj(tmpColumnValuesObj);
  }, [props.columnConfigurationData]);

  const SetObjValues = (
    key: string,
    value: any,
    isChanged: boolean = true,
    errorMessage: string | null = null
  ): void => {
    setColumnValuesObj({
      ...columnValuesObj,
      [key]: { value: value, isChanged: isChanged, error: errorMessage }
    });
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
    selectedOption: IComboBoxOption | undefined,
    item: any
  ): void => {
    SetObjValues(item.key, selectedOption?.key);
  };

  const onNumericFormatUpdate = (
    ev: SyntheticEvent<HTMLInputElement, Event> | undefined,
    text: string,
    item: any
  ): void => {
    SetObjValues(item.key, text);
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

  const onPanelSubmit = (): void => {
    var objectKeys = Object.keys(columnValuesObj);
    objectKeys.forEach((objKey) => {
      if (columnValuesObj[objKey]['isChanged']) {
        updateObj[objKey] = columnValuesObj[objKey]['value'];
      }
    });

    props.onChange(updateObj);
  };

  const onCellDateChange = (date: Date | null | undefined, item: any): void => {
    SetObjValues(item.key, date);
  };

  const onCellPickerTagListChanged = (cellPickerTagList: ITag[] | undefined, item: any): void => {
    if (cellPickerTagList && cellPickerTagList[0] && cellPickerTagList[0].name)
      SetObjValues(item.key, cellPickerTagList[0].name);
    else SetObjValues(item.key, '');
  };

  const [comboOptions, setComboOptions] = useState<IComboBoxOption[]>([]);
  const [init, setInit] = useState<boolean>(false);

  const createTextFields = (): any[] => {
    let tmpRenderObj: any[] = [];
    props.columnConfigurationData
      .filter((x) => x.editable == true)
      .forEach((item) => {
        switch (item.inputType) {
          case EditControlType.Date:
            tmpRenderObj.push(
              <DatePicker
                key={item.key}
                label={item.text}
                strings={DayPickerStrings}
                placeholder="Select a date..."
                ariaLabel="Select a date"
                onSelectDate={(date) => onCellDateChange(date, item)}
                //value={props != null && props.panelValues != null ? new Date(props.panelValues[item.key]) : new Date()}
                value={new Date()}
              />
            );
            break;
          case EditControlType.Picker:
            tmpRenderObj.push(
              <div key={item.key}>
                <span className={controlClass.pickerLabel}>{item.text}</span>
                <PickerControl
                  arialabel={item.text}
                  selectedItemsLimit={1}
                  pickerTags={item.pickerOptions?.pickerTags ?? []}
                  minCharLimitForSuggestions={2}
                  onTaglistChanged={(selectedItem: ITag[] | undefined) =>
                    onCellPickerTagListChanged(selectedItem, item)
                  }
                  pickerDescriptionOptions={item.pickerOptions?.pickerDescriptionOptions}
                />
              </div>
            );
            break;
          case EditControlType.DropDown:
            tmpRenderObj.push(
              <Dropdown
                key={item.key}
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
              />
            );
            break;
          case EditControlType.ComboBox:
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
                  isClearable={true}
                  backspaceRemovesValue
                  escapeClearsValue
                  openMenuOnFocus
                  options={
                    item.comboBoxOptions
                      ?.map((itm) => {
                        return { value: itm.key, label: itm.text };
                      })
                      ?.concat({ value: '', label: '' }) ?? []
                  }
                  value={item.comboBoxOptions
                    ?.map((item) => {
                      return { value: item.key, label: item.text };
                    })
                    .find(
                      (x) =>
                        x.label == columnValuesObj[item.key].value?.toString() ||
                        x.value == columnValuesObj[item.key].value?.toString()
                    )}
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
            break;
          case EditControlType.CheckBox:
            tmpRenderObj.push(
              <Checkbox
                key={item.key}
                label={item.text}
                onChange={(ev, isChecked) => {
                  onCheckBoxChange(ev, isChecked ?? false, item);
                }}
              />
            );
            break;
          case EditControlType.NumericFormat:
            tmpRenderObj.push(
              <NumericFormat
                key={item.key}
                value={columnValuesObj[item.key].value?.toString() || ''}
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
                decimalSeparator={
                  item.validations?.numericFormatProps?.formatProps?.decimalSeparator
                }
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
                onValueChange={(values, sourceInfo) =>
                  onNumericFormatUpdate(
                    sourceInfo.event,
                    values.formattedValue ?? values.value,
                    item
                  )
                }
              />
            );
            break;
          case EditControlType.MultilineTextField:
            tmpRenderObj.push(
              <TextField
                key={item.key}
                errorMessage={columnValuesObj[item.key].error}
                name={item.text}
                multiline={true}
                rows={1}
                id={item.key}
                label={item.text}
                styles={textFieldStyles}
                onChange={(ev, text) => onTextUpdate(ev, text!, item)}
                value={columnValuesObj[item.key].value || ''}
              />
            );
            break;
          default:
            tmpRenderObj.push(
              <TextField
                key={item.key}
                errorMessage={columnValuesObj[item.key].error}
                name={item.text}
                id={item.key}
                label={item.text}
                styles={textFieldStyles}
                onChange={(ev, text) => onTextUpdate(ev, text!, item)}
                value={columnValuesObj[item.key].value || ''}
              />
            );
            break;
        }
      });
    return tmpRenderObj;
  };

  return (
    <Stack>
      <Stack tokens={verticalGapStackTokens}>{columnValuesObj && createTextFields()}</Stack>
      <Stack horizontal disableShrink styles={stackStyles} tokens={horizontalGapStackTokens}>
        <PrimaryButton
          text="Save To Grid"
          className={controlClass.submitStylesEditpanel}
          onClick={onPanelSubmit}
          allowDisabledFocus
          disabled={
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

export default EditPanel;
