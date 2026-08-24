import { Select, Upload, Button } from "antd";
import { StyledInput, StyledNumber, StyledSelect, StyledDatePicker, StyledTimePicker, StyledTextArea } from "../components/StyledComponents";
import { TicketCustomFields, SelectOption } from "../types/TicketsCateg_drawer";
import { UploadOutlined } from "@ant-design/icons"
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../styles/react-quill.css"

const isReadonly = (field: TicketCustomFields) => {
  const mode = field.ValueMode?.toLowerCase();
  return mode === "generated" || mode === "actual";
};


export const renderField = (field: TicketCustomFields) => {
  const readOnly = isReadonly(field);

  switch (field.FieldType) {
    case "File Uploader":
      return (
        <Upload beforeUpload={() => false} multiple>
          <Button icon={<UploadOutlined />} style={{ fontSize:12 }}>
            Upload File
          </Button>
        </Upload>
      );
    case "Text":
      if (field.FieldName == "GroupName")
        return <StyledInput addonBefore="KWEPH - Group Email -" 
              readOnly={readOnly} />
      else if (field.FieldName == "GroupEmailAddress")
        return <StyledInput addonAfter=".kweph@kwe.com" 
          readOnly={readOnly} />
      else
        return <StyledInput readOnly={readOnly}/>;
    case "Number":
      return <StyledNumber style={{ width: "100%" }} />;
    case "Date":
      return <StyledDatePicker style={{ width: "100%" }} />;
    case "TimePicker":
      return <StyledTimePicker style={{ width: "100%" }} />;
    case "Select":
      // if options are already present
      if (field.options) {
        return (
          <StyledSelect
            showSearch
            optionFilterProp="label"
          >
            {field.options.map((opt: SelectOption, index) => (
              <Select.Option key={index} label={opt.label} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </StyledSelect>
        );
      }

      // if options need to be fetched dynamically from DB
      // you can later load them via useEffect + state in the parent component
      return <StyledSelect placeholder="Loading options..." />;

    case "Rich Editor":
      return (
        <ReactQuill
          theme="snow"
          className="quill-small"
        />
      );
    case "Textarea":
      return <StyledTextArea style={{ width: "100%" }} />;
    default:
      return <StyledInput />; // fallback
  }
};