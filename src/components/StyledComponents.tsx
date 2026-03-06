import styled from "styled-components";
import { Input, Button, Form, Select, DatePicker } from "antd";


export const Container = styled.div`
    padding: 16px;
`

export const SearchContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
`
export const SearchInput = styled(Input)`
    width: 100%;
    max-width: 500px;
    font-size: 13px;
`

export const AddButton = styled(Button)`
    width: 100%;
    max-width: 300px;
`

export const SubmitButton = styled(Button)`
    width: 100%;
`

export const NormalButton = styled(Button)`
    width: 100%;
`

export const StyledFormItem = styled(Form.Item)`
    .ant-form-item-label > label {
    font-weight: 300;
    color: #000;
    font-size:13px;
  }
`

export const StyledInput = styled(Input)`
    font-size: 12px;
    letter-spacing: 0.7px;
`

export const StyledSelect = styled(Select)`
  font-size: 12px !important;

  .ant-select-selector {
    font-size: 12px !important;
  }

  .ant-select-selection-item {
    font-size: 12px !important;
    letter-spacing: 0.7px;
  }

  .ant-select-selection-placeholder {
    font-size: 12px !important;
  }
`


export const StyledDatePicker = styled(DatePicker)`
    font-size: 12px !important;
    letter-spacing: 0.7px;
    input {
        font-size: 12px !important; /* Ensures the text inside also resizes */
    }
`