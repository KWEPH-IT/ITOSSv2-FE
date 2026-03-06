import { Row, Col, Drawer, Space, Form, Button, Card, message } from 'antd'
import { Container, StyledInput, StyledSelect, SubmitButton } from '../../../components/StyledComponents'
import { DrawerProps } from '../../../types/Drawer'
import { TicketCategProps } from '../../../types/TicketsCateg_drawer'
import React from 'react'
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useTicketCategs } from '../../../hooks/configuration/ticketCateg_hooks'
import { getEmployees } from '../../../hooks/configuration/vwAtKWE_hooks'
import { vwAtKWEProps } from '../../../types/vwAtKWE_drawer'

const TicketCategoriesForm: React.FC<DrawerProps & {record? : TicketCategProps | null}> = ({isDrawerOpen, drawerMode, closeDrawer, onUserAction, record}) => {
    const { categ } = useTicketCategs();
    const { employees } = getEmployees();
    const [ form ] = Form.useForm();


    const onFinish = async(values: any) => {
        try{
            const formattedCustomFields = (values.custom_fields || []).map(
                (level: any) => ({
                    FieldType: level.FieldType,
                    FieldName: level.FieldName || null
                })
            )

            const formattedApprovalLevel = (values.approvers || []).map(
                (level: any, index: number) => ({
                    LevelNo: index + 1,
                    ApproverType: level.ApproverType,
                    ApproverValue: level.ApproverValue || null
                })
            )

            const payload = {
                name: values.Name,
                ParentId: values.ParentId? values.ParentId : null,
                CustomFields: formattedCustomFields,
                ApproverLevel: formattedApprovalLevel
            }


            console.log(payload);
        }
        catch(error){
            message.error("Failed to save record " + error)
        }
    }
  
    return (
    <Container>
        <Drawer 
            title="Add Ticket Categories"
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
            <Form layout='vertical' form={form} onFinish={onFinish}>
                <Row>
                    <Col span={24}>
                        <Form.Item label="Ticket Name" name="Name" rules={[{ required: true }]}>
                            <StyledInput></StyledInput>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Parent ID" name="ParentId">
                            <StyledSelect>
                                { categ?.maps((item: TicketCategProps) => ( 
                                    <StyledSelect.Option
                                        key={item.SystemId}
                                        value={item.SystemId}
                                        label={item.Name}
                                        style={{ fontSize: "13px", fontWeight: "600" }}
                                    >{item.SystemId} - {item.Name}</StyledSelect.Option>
                                    )
                                 )
                                }
                            </StyledSelect>
                        </Form.Item>
                    </Col>
                </Row>

                <Card variant='borderless' >
                    <p style={{ fontWeight: 600, letterSpacing: 0.7, fontSize: 15,color: "#1677ff" }}> Custom Fields </p>
                   
                    <Form.List name="custom_fields">
                        {(fields, { add, remove }) => (
                            <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Row key={key} style={{ display: 'flex', marginBottom: 8 }} gutter={[16,16]}>
                                    <Col span={11}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'FieldName']}
                                            rules={[{ required: true, message: 'Missing Field Name' }]}
                                        >
                                            <StyledInput placeholder="Field Name" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'FieldType']}
                                            rules={[{ required: true, message: 'Missing Field Type' }]}
                                        >
                                            <StyledSelect placeholder="Select Field Type">
                                            <StyledSelect.Option value="text">Text</StyledSelect.Option>
                                            <StyledSelect.Option value="number">Number</StyledSelect.Option>
                                            <StyledSelect.Option value="textarea">Textarea</StyledSelect.Option>
                                            <StyledSelect.Option value="select">Select</StyledSelect.Option>
                                            </StyledSelect>
                                        </Form.Item>
                                    </Col>
                                    <Col span={1}>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item shouldUpdate noStyle>
                                            {({ getFieldValue }) => {
                                            const type = getFieldValue(['custom_fields', name, 'FieldType']);

                                            if (type !== 'select') return null;

                                            return (
                                                <>
                                                {/* Select Source Type */}
                                                <Row gutter={16}>
                                                    <Col span={12}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'SelectSourceType']}
                                                        rules={[{ required: true, message: 'Select source required' }]}
                                                    >
                                                        <StyledSelect placeholder="Select Source Type">
                                                        <StyledSelect.Option value="static">
                                                            Static Options
                                                        </StyledSelect.Option>
                                                        <StyledSelect.Option value="table">
                                                            From Database Table
                                                        </StyledSelect.Option>
                                                        </StyledSelect>
                                                    </Form.Item>
                                                    </Col>
                                                </Row>
                                                </>
                                            );
                                            }}
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item shouldUpdate noStyle>
                                        {({ getFieldValue }) => {
                                            const sourceType = getFieldValue(['custom_fields', name, 'SelectSourceType']);

                                            if (sourceType !== 'table') return null;

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
                    <p style={{ fontWeight: 600, letterSpacing: 0.7, fontSize: 15,color: "#1677ff" }}> Approval Levels </p>
                   
                    <Form.List name="approvers">
                        {(fields, { add, remove }) => (
                            <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Row key={key} style={{ display: 'flex', marginBottom: 8 }} gutter={[16,16]}>
                                    <Col span={3}>
                                        <div>Level {name + 1}</div>
                                    </Col>
                                    <Col span={10}>
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
                                    <Col span={10}>
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
                                                        <StyledSelect.Option value="IT Technical Support Supervisor">
                                                            IT Technical Support Supervisor
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
                                                    placeholder="Select User"
                                                    optionFilterProp="children"
                                                    >
                                                    { employees.map((i: vwAtKWEProps) => (
                                                        <StyledSelect.Option value={i.EmployeeId}>{i.FullName}</StyledSelect.Option>
                                                    ))}
                                                    </StyledSelect>
                                                </Form.Item>
                                                );
                                            }

                                            return null;
                                            }}
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