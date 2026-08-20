import { useEffect, useState } from 'react';
import { Row, Col, Drawer, Space, Form, Button, Card, message, Avatar } from 'antd'
import { Container, StyledInput, StyledTextArea, StyledSelect, SubmitButton } from '../../../components/StyledComponents'
import { DrawerProps } from '../../../types/Drawer'
import { TicketCategProps } from '../../../types/TicketsCateg_drawer'
import React from 'react'
import { MinusCircleOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { useTicketCategs } from '../../../hooks/configuration/ticketCateg_hooks'
import { getEmployees } from '../../../hooks/configuration/vwAtKWE_hooks'
import { vwAtKWEProps } from '../../../types/vwAtKWE_drawer'
import { getSystems } from '../../../hooks/configuration/systemProfile_hooks';
import { SystemProfileProps } from '../../../types/SystemProfile_drawer';
import API from '../../../api/api'


const TicketCategoriesForm: React.FC<DrawerProps & {record? : TicketCategProps | null}> = ({isDrawerOpen, drawerMode, closeDrawer, onUserAction, record}) => {
    const { categ } = useTicketCategs();
    const { employees } = getEmployees();
    const [ form ] = Form.useForm();
    const [ parent, setParent ] = useState("");
    const { systems } = getSystems();

    useEffect(() => {
        console.log(systems)
        if (drawerMode === "edit" && record){
          form.setFieldsValue({
            ...(record ?? {}),
            // Status: Number(record?.Status),
            
          });
        }
        else{
          form.resetFields()
          form.setFieldsValue({
            Status: 1,

          })
        }
      },[drawerMode, record, form])


    const onFinish = async(values: any) => {
        try{
            const formattedCustomFields = (values.custom_fields || []).map((level: any) => {
                let staticOptions = null;
            
                // If the field is a 'select' with static source
                if (level.FieldType === 'Select' && level.SelectSourceType === 'static') {
                    // Convert the options array to JSON string
                    staticOptions = level.StaticOptions || [];
                }
            
                return {
                    FieldType: level.FieldType,
                    FieldName: level.FieldName,
                    FieldLabel: level.FieldLabel,
                    IsGroup: level.IsGroup,
                    GroupName: level.GroupName || null,
                    IsRepeatable: level.IsRepeatable,
                    ValueMode: level.ValueMode,
                    SelectSourceType: level.SelectSourceType || null,
                    TableName: level.TableName || null,
                    ValueColumn: level.ValueColumn || null,
                    LabelColumn: level.LabelColumn || null,
                    StaticOptions: staticOptions, // <-- new field
                };
            });

            const formattedApprovalLevel = (values.approvers || []).map(
                (level: any, index: number) => ({
                    LevelNo: index + 1,
                    ApproverType: level.ApproverType,
                    ApproverValue: level.ApproverValue || null,
                    Description: level.Description
                })
            )

            const formattedAssignment = (values.assignments || []).map(
                (assign: any) => ({
                    AssignmentId: assign.AssignmentId,
                    AssignmentName: assign.AssignmentName,
                    AssignmentEmail: assign.AssignmentEmail,
                })
            )

            const payload = {
                systemId: record?.SystemId, 
                name: values.Name,
                ParentId: values.ParentId? values.ParentId : null,
                IsSNConnected: values.IsSNConnected? values.IsSNConnected : null,
                Inhouse: values.Inhouse? values.Inhouse : null,
                Description: values.Description? values.Description : null,
                CustomFields: formattedCustomFields,
                ApproverLevel: formattedApprovalLevel,
                Assignment: formattedAssignment
            }

            console.log(payload);
            
            let response;

            if (drawerMode === "edit") {
                response = await API.put(`/api/TicketCateg`, payload);
            } else {
                response = await API.post(`/api/createTicketCateg`, payload);
            }

            if(response.status === 200){
                message.success(response.data.message)
                form.resetFields()
                closeDrawer()
                onUserAction()
            }
        }
        catch(error){
            message.error("Failed to save record " + error)
        }
    }
  
    return (
    <Container>
        <Drawer 
            title={drawerMode === "add" ? "Add Ticket Category" : "Edit Ticket Category Details"}
            width={1000}
            placement="right"
            onClose={closeDrawer}
            open={isDrawerOpen}
            extra={
            <Space>
                <Button onClick={closeDrawer} >Cancel</Button>
            </Space>
            }
        >
            <Form layout='vertical' form={form} onFinish={onFinish} >
                <Row>
                    <Col span={24}>
                        <Form.Item label="Ticket Name" name="Name" rules={[{ required: true }]}>
                            <StyledInput></StyledInput>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Parent ID" name="ParentId">
                            <StyledSelect 
                                onChange={(value) => {
                                    const prt = categ.find((e: TicketCategProps) => e.SystemId === value);
                                    setParent(prt?.Name)}
                                }>
                                { categ?.map((item: TicketCategProps) => ( 
                                    <StyledSelect.Option
                                        key={item.SystemId}
                                        value={item.SystemId}
                                        label={item.SystemId}
                                        style={{ fontSize: "13px", fontWeight: "600" }}
                                    >{item.SystemId} - {item.Name}</StyledSelect.Option>
                                    )
                                 )
                                }
                            </StyledSelect>
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item label="Is connected to Service Now?" name="IsSNConnected">
                            <StyledSelect >
                                <StyledSelect.Option value={1} label="Yes">Yes</StyledSelect.Option>
                                <StyledSelect.Option value={0} label="No" >No</StyledSelect.Option>
                            </StyledSelect>
                        </Form.Item>
                    </Col>

                        { parent?.includes("In-house") || record?.Inhouse && (
                        <Col span={24}>
                          <Form.Item label="Choose In-house System" name="Inhouse">
                            <StyledSelect >
                                { 
                                    systems?.map((sys: SystemProfileProps) => (
                                        <StyledSelect.Option 
                                            key={sys.SystemId}
                                            value={sys.SystemAlias}
                                            label={sys.SystemAlias}
                                            style={{ fontSize: "13px", fontWeight: "600" }}
                                        >
                                            {sys.SystemName}
                                        </StyledSelect.Option>
                                    ))
                                }


                            </StyledSelect>
                          </Form.Item>
                        </Col>
                        )}

                    <Col span={24}>
                        <Form.Item label="Short Description" name="Description">
                            <StyledTextArea/>
                        </Form.Item>
                    </Col>
                </Row>

                <Card variant='borderless' >
                    <p style={{ fontWeight: 600, letterSpacing: 0.7, fontSize: 15,color: "#1677ff" }}> Custom Fields </p>
                   
                    <Form.List name="custom_fields">
                        {(fields, { add, remove }) => (
                            <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card
                                    key={`card-${key}`}
                                    size="small"
                                    title={`Field ${name + 1}`}
                                    extra={<MinusCircleOutlined onClick={() => remove(name)} />}
                                    style={{ background: "#f0f5ff",
                                        padding: "16px",
                                        marginBottom: "16px",
                                        borderRadius: "8px",
                                        border: "1px solid #adc6ff",
                                        borderLeft: "3px solid #1677ff"   }}
                                    >
                                    <Row key={key} style={{ display: 'flex'}} gutter={[16, 16]}>
                                        {/* Field Name */}
                                        <Col span={8}>
                                            <Form.Item
                                            {...restField}
                                            name={[name, 'FieldName']}
                                            rules={[{ required: true, message: 'Missing Field Name' }]}
                                            >
                                            <StyledInput placeholder="Field Name" />
                                            </Form.Item>
                                        </Col>

                                        {/* Field Label */}
                                        <Col span={8}>
                                            <Form.Item
                                            {...restField}
                                            name={[name, 'FieldLabel']}
                                            rules={[{ required: true, message: 'Missing Field Label' }]}
                                            >
                                            <StyledInput placeholder="Field Label" />
                                            </Form.Item>
                                        </Col>

                                        {/* Field Type */}
                                        <Col span={4}>
                                            <Form.Item
                                            {...restField}
                                            name={[name, 'FieldType']}
                                            rules={[{ required: true, message: 'Missing Field Type' }]}
                                            >
                                            <StyledSelect placeholder="Select Field Type">
                                                <StyledSelect.Option value="Date">DatePicker</StyledSelect.Option>
                                                <StyledSelect.Option value="File Uploader">File Uploader</StyledSelect.Option>
                                                <StyledSelect.Option value="Number">Number</StyledSelect.Option>
                                                <StyledSelect.Option value="Rich Editor">Rich Text Editor</StyledSelect.Option>
                                                <StyledSelect.Option value="Select">Select</StyledSelect.Option>
                                                <StyledSelect.Option value="Text">Text</StyledSelect.Option>
                                                <StyledSelect.Option value="Textarea">Textarea</StyledSelect.Option>
                                                <StyledSelect.Option value="Time">TimePicker</StyledSelect.Option>
                                            </StyledSelect>
                                            </Form.Item>
                                        </Col>

                                        {/* Field Type */}
                                        <Col span={4}>
                                            <Form.Item
                                            {...restField}
                                            name={[name, 'ValueMode']}
                                            rules={[{ required: true, message: 'Missing Value Mode' }]}
                                            >
                                            <StyledSelect placeholder="Select Value Mode">
                                                <StyledSelect.Option value="Actual">Actual</StyledSelect.Option>
                                                <StyledSelect.Option value="Generated">Generated</StyledSelect.Option>
                                                <StyledSelect.Option value="Manual">Manual</StyledSelect.Option>
                                            </StyledSelect>
                                            </Form.Item>
                                        </Col>

                                    </Row>
                                    
                                    <Row key={`group-${key}`} style={{ display: 'flex'}} gutter={[16, 16]}>
                                        {/* Field Name */}
                                        <Col span={8}>
                                            <Form.Item
                                            {...restField}
                                            name={[name, 'IsGroup']}
                                            rules={[{ required: true, message: 'Missing Group Identifier' }]}
                                            >
                                            <StyledSelect placeholder="Is this field inside a group?">
                                                <StyledSelect.Option value="1">Yes</StyledSelect.Option>
                                                <StyledSelect.Option value="2">No</StyledSelect.Option>
                                            </StyledSelect>
                                            </Form.Item>
                                        </Col>

                                        {/* Field Label */}
                                        <Col span={8}>
                                            <Form.Item
                                            {...restField}
                                            name={[name, 'GroupName']}
                                            rules={[
                                                ({ getFieldValue }) => ({
                                                  validator(_, value) {
                                                    const isGroup = getFieldValue([name, 'IsGroup']);
                                          
                                                    if (isGroup === "1" && !value) {
                                                      return Promise.reject('Missing Group Name');
                                                    }
                                          
                                                    return Promise.resolve();
                                                  },
                                                }),
                                              ]}
                                            >
                                            <StyledInput placeholder="Group Name" />
                                            </Form.Item>
                                        </Col>

                                        {/* Field Type */}
                                        <Col span={8}>
                                            <Form.Item
                                            {...restField}
                                            name={[name, 'IsRepeatable']}
                                            rules={[{ required: true, message: 'Repeatable setting is required' }]}
                                            >
                                            <StyledSelect placeholder="Allow multiple entries?">
                                                <StyledSelect.Option value="1">Yes</StyledSelect.Option>
                                                <StyledSelect.Option value="2">No</StyledSelect.Option>
                                            </StyledSelect>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    {/* Conditional SelectSourceType */}
                                    <Row gutter={[16,0]}>
                                        <Col span={7}>
                                            <Form.Item shouldUpdate noStyle>
                                                {({ getFieldValue }) => {
                                                    const type = getFieldValue(['custom_fields', name, 'FieldType']);
                                                    if (type !== 'Select') return null;
                                                    return (
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'SelectSourceType']}
                                                            rules={[{ required: true, message: 'Select source required' }]}
                                                        >
                                                            <StyledSelect placeholder="Select Source Type">
                                                            <StyledSelect.Option value="static">Static Options</StyledSelect.Option>
                                                            <StyledSelect.Option value="table">From Database Table</StyledSelect.Option>
                                                            </StyledSelect>
                                                        </Form.Item>
                                                    );
                                                }}
                                            </Form.Item>
                                        </Col>

                                        {/* Static options fields */}
                                        <Col span={12}>
                                            <Form.Item shouldUpdate noStyle>
                                            {({ getFieldValue }) => {
                                                const sourceType = getFieldValue(['custom_fields', name, 'SelectSourceType']);
                                                if (sourceType !== 'static') return null;

                                                return (
                                                <Form.List name={[name, 'StaticOptions']}>
                                                    {(optionFields, { add: addOption, remove: removeOption }) => (
                                                    <>
                                                        {optionFields.map(({ key: optKey, name: optName, ...optRest }) => (
                                                        <Row key={optKey} gutter={10} >
                                                            <Col span={12}>
                                                            <Form.Item
                                                                {...optRest}
                                                                name={[optName, 'label']}
                                                                rules={[{ required: true, message: 'Option Label required' }]}
                                                            >
                                                                <StyledInput placeholder="Option Label" />
                                                            </Form.Item>
                                                            </Col>
                                                            <Col span={11}>
                                                            <Form.Item
                                                                {...optRest}
                                                                name={[optName, 'value']}
                                                                rules={[{ required: true, message: 'Option Value required' }]}
                                                            >
                                                                <StyledInput placeholder="Option Value" />
                                                            </Form.Item>
                                                            </Col>
                                                            <Col span={1}>
                                                            <MinusCircleOutlined onClick={() => removeOption(optName)} />
                                                            </Col>
                                                        </Row>
                                                        ))}
                                                        <Button
                                                        type="dashed"
                                                        onClick={() => addOption()}
                                                        block
                                                        icon={<PlusOutlined />}
                                                        
                                                        >
                                                        Add Option
                                                        </Button>
                                                    </>
                                                    )}
                                                </Form.List>
                                                );
                                            }}
                                            </Form.Item>
                                        </Col>

                                        {/* Table fields for table source */}
                                        <Col span={24}>
                                            <Form.Item shouldUpdate noStyle>
                                            {({ getFieldValue }) => {
                                                const tableType = getFieldValue(['custom_fields', name, 'SelectSourceType']);
                                                if (tableType !== 'table') return null;

                                                return (
                                                <Row gutter={16}>
                                                    <Col span={8}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'TableName']}
                                                        rules={[{ required: true, message: 'Table required' }]}
                                                    >
                                                        <StyledInput placeholder="Table Name" />
                                                    </Form.Item>
                                                    </Col>
                                                    <Col span={8}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'ValueColumn']}
                                                        rules={[{ required: true, message: 'Value column required' }]}
                                                    >
                                                        <StyledInput placeholder="Value Column" />
                                                    </Form.Item>
                                                    </Col>
                                                    <Col span={8}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'LabelColumn']}
                                                        rules={[{ required: true, message: 'Label column required' }]}
                                                    >
                                                        <StyledInput placeholder="Label Column" />
                                                    </Form.Item>
                                                    </Col>
                                                </Row>
                                                );
                                            }}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                            ))}

                            {/* Add new field button */}
                            <Col span={24} style={{ marginTop: "20px" }}>
                                <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add field
                                </Button>
                                </Form.Item>
                            </Col>
                            </>

                        )}
                        </Form.List>


                </Card>

                <Card variant='borderless' >
                    <p style={{ fontWeight: 600, letterSpacing: 0.7, fontSize: 15,color: "#1677ff" }}> Approval Levels </p>
                   
                    <Form.List name="approvers">
                        {(fields, { add, remove }) => (
                            <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Row key={key} style={{ display: 'flex', marginBottom: 8 }} gutter={[16,16]}>
                                    <Col span={3}>
                                        <div>Level {name + 1}</div>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'ApproverType']}
                                            rules={[{ required: true, message: 'Missing Approver Type' }]}
                                        >
                                            <StyledSelect  placeholder="Please select Approver Type">
                                                <StyledSelect.Option value="Dynamic Superior">Dynamic Superior</StyledSelect.Option>
                                                <StyledSelect.Option value="Dynamic Manager">Dynamic Manager</StyledSelect.Option>
                                                <StyledSelect.Option value="Role">Role</StyledSelect.Option>
                                                <StyledSelect.Option value="Specific User">Specific User</StyledSelect.Option>
                                            </StyledSelect>
                                        </Form.Item>
                                    </Col>
                                    <Col span={7}>
                                        <Form.Item shouldUpdate noStyle>
                                            {({ getFieldValue }) => {
                                            const type = getFieldValue(['approvers', name, 'ApproverType']);

                                            if (!type || type === 'Dynamic Superior' || type === 'Dynamic Manager') {
                                                return null; // Hide ApproverValue
                                            }

                                            if (type === 'Role') {
                                                return (
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'ApproverValue']}
                                                    rules={[{ required: true, message: 'Missing Role' }]}
                                                >
                                                    <StyledSelect placeholder="Select Role">
                                                        <StyledSelect.Option value="HR MANAGER">
                                                            HR Manager
                                                        </StyledSelect.Option>
                                                        <StyledSelect.Option value="IT MANAGER">
                                                            IT Manager
                                                        </StyledSelect.Option>
                                                        <StyledSelect.Option value="Network Administrator">
                                                            Network Administrator
                                                        </StyledSelect.Option>
                                                        <StyledSelect.Option value="User Support Services Supervisor">
                                                            User Support Services Supervisor
                                                        </StyledSelect.Option>
                                                    </StyledSelect>
                                                </Form.Item>
                                                );
                                            }

                                            if (type === 'Specific User') {
                                                return (
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'ApproverValue']}
                                                    rules={[{ required: true, message: 'Missing User' }]}
                                                >
                                                    <StyledSelect
                                                        showSearch
                                                        optionFilterProp="label"
                                                        placeholder="Please select Employee"
                                                        optionLabelProp="label"
                                                    >
                                                    { employees.map((i: vwAtKWEProps) => (
                                                        <StyledSelect.Option employee={i} label={i.CompleteName} key={i.EmployeeId} value={i.EmployeeId} style={{ fontSize: 12 }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                {/* Avatar */}
                                                                <Avatar
                                                                    size={40}               // ✅ fixed size
                                                                    style={{
                                                                        backgroundColor: "#dadada",
                                                                        borderRadius: 12,      // rounded-xl
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        flexShrink: 0,        // prevent shrinking when text is long
                                                                    }}
                                                                    icon={<UserOutlined style={{ color: "#fff", fontSize: 20 }} />}
                                                                />

                                                                {/* Texts */}
                                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                                <span style={{ fontWeight: 600 }}>{i.CompleteName}</span>
                                                                <span style={{ fontSize: 12, color: "#888", fontWeight: 300 }}>{i.EmployeeId} • {i.Department} </span>
                                                                </div>
                                                            </div>
                                                        </StyledSelect.Option>
                                                    ))}
                                                    </StyledSelect>
                                                </Form.Item>
                                                );
                                            }

                                            return null;
                                            }}
                                        </Form.Item>
                                    </Col>
                                    <Col span={7}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'Description']}
                                            rules={[{ required: true, message: 'Missing Description' }]}
                                        >
                                            <StyledInput placeholder="Description" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={1}>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Col>
                                    
                                </Row>
                            ))}
                            <Col span={24}>
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add field
                                    </Button>
                                </Form.Item>
                            </Col>
                            </>
                        )}
                    </Form.List>
                </Card>


                <Card variant='borderless' >
                    <p style={{ fontWeight: 600, letterSpacing: 0.7, fontSize: 15,color: "#1677ff" }}> Assignment </p>
                   
                    <Form.List name="assignments">
                        {(fields, { add, remove }) => (
                            <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Row key={key} style={{ display: 'flex', marginBottom: 8 }} gutter={[16,16]}>

                                    <Col span={8}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'AssignmentId']}
                                            rules={[{ required: true, message: 'Missing Assignment' }]}
                                        >
                                            <StyledSelect  placeholder="Please select Personnel" 
                                                showSearch
                                                optionFilterProp="label"
                                                optionLabelProp="label"
                                                onChange={(value) => {
                                                    const selected = employees.find((emp : vwAtKWEProps) => emp.EmployeeId === value);
                                                    if (selected) {
                                                        form.setFieldValue(['assignments', name, 'AssignmentName'], selected.CompleteName);
                                                        form.setFieldValue(['assignments', name, 'AssignmentEmail'], selected.EmailAddress);
                                                    }
                                                }}
                                                >
                                                { employees.map((i: vwAtKWEProps) => (
                                                    <StyledSelect.Option 
                                                        key={i.EmployeeId} 
                                                        value={i.EmployeeId}
                                                        label={`${i.EmployeeId} • ${i.CompleteName}`}
                                                        style={{ fontSize: 12 }}
                                                    >
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                            {/* Avatar */}
                                                            <Avatar
                                                                size={40}               // ✅ fixed size
                                                                style={{
                                                                    backgroundColor: "#dadada",
                                                                    borderRadius: 12,      // rounded-xl
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    flexShrink: 0,        // prevent shrinking when text is long
                                                                }}
                                                                icon={<UserOutlined style={{ color: "#fff", fontSize: 20 }} />}
                                                            />

                                                            {/* Texts */}
                                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                            <span style={{ fontWeight: 600 }}>{i.CompleteName}</span>
                                                            <span style={{ fontSize: 12, color: "#888", fontWeight: 300 }}>{i.EmployeeId} • {i.Department} </span>
                                                            </div>
                                                        </div>
                                                    </StyledSelect.Option>
                                                ))}
                                            </StyledSelect>
                                        </Form.Item>
                                    </Col>
                                    
                                    <Col span={8}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'AssignmentName']}
                                            rules={[{ required: true, message: 'Missing Assignment' }]}
                                        >
                                            <StyledInput placeholder="Employee Name" readOnly/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={7}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'AssignmentEmail']}
                                            rules={[{ required: true, message: 'Missing Assignment' }]}
                                        >
                                            <StyledInput placeholder="Employee Name" readOnly/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={1}>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Col>
                                    
                                </Row>
                            ))}
                            <Col span={24}>
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add field
                                    </Button>
                                </Form.Item>
                            </Col>
                            </>
                        )}
                    </Form.List>
                </Card>
                
                <SubmitButton block htmlType='submit' style={{ backgroundColor: "#000", color: "#FFF", height: "35px", letterSpacing: 0.7, fontWeight: 600 }} > Submit </SubmitButton>

            </Form>

    </Drawer>
    </Container>
  )
}

export default TicketCategoriesForm