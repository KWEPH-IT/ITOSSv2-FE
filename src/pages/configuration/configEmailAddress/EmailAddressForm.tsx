import React, { useState } from 'react'
import { DrawerProps } from '../../../types/Drawer'
import { EmailAddressProps } from '../../../types/EmailAddress_drawer';
import { SubmitButton, Container, StyledFormItem, StyledInput, StyledSelect } from '../../../components/StyledComponents';
import { Form, Drawer, Space, Button, Row, Col,  } from 'antd'
import { SaveOutlined } from "@ant-design/icons";
import { getEmployees } from '../../../hooks/configuration/vwAtKWE_hooks';
import { vwAtKWEProps } from '../../../types/vwAtKWE_drawer';

const EmailAddressForm: React.FC<DrawerProps> = ({isDrawerOpen, closeDrawer, onUserAction}) => {
    const [ form ] = Form.useForm();
    const [ isSubmit, setIsSubmit ] = useState(false);
    const { employees } = getEmployees(); 

    return (
        <Container>
            <Drawer 
                title="Add New Email Profile"
                placement="right"
                onClose={closeDrawer}
                open={isDrawerOpen}
                width={1000} // adjust as needed
                extra={
                <Space>
                    <Button onClick={closeDrawer}>Cancel</Button>
                    <SubmitButton type="primary" htmlType="submit" loading={isSubmit} onClick={()=> form.submit()}>
                    <SaveOutlined /> Submit
                    </SubmitButton>
                </Space>
                }
            >
            <Form form={form}  layout='vertical'  >
                <Row gutter={12}>
                    <Col span={12}>
                        <StyledFormItem
                            label={
                            <span style={{ fontWeight: "bold", color: "#1890ff" }}>
                                Select Employee
                            </span>
                            }
                            rules={[{ required: true, message: "Please select Employee" }]}
                        >
                            <StyledSelect
                            //  onChange={handleSelect}
                            showSearch
                            optionFilterProp="label"
                            placeholder="Please select Employee Name"
                            >
                            {employees?.map((emp: vwAtKWEProps) => (
                                <StyledSelect.Option
                                key={emp.EmployeeId}
                                value={emp.EmployeeId}
                                label={emp.FullName}
                                style={{ fontSize: "13px", fontWeight: "600" }}
                                >
                                {emp.EmployeeId} - {emp.FullName}
                                </StyledSelect.Option>
                            ))}
                            </StyledSelect>
                        </StyledFormItem>
                    </Col>
                    <Col span={12}>
                        <StyledFormItem name="SystemAlias" label="System Alias" rules={[{ required: true, message: "Please input system alias!" }]}>
                            <StyledInput  />
                        </StyledFormItem>
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col span={12}>
                        <StyledFormItem name="SourceCodeServer" label="Source Code Server" rules={[{ required: true, message: "Please input source code server!" }]}>
                            <StyledInput  />
                        </StyledFormItem>
                    </Col>
                    
                    <Col span={12}>
                        <StyledFormItem name="DBServerName" label="Database Server Name" rules={[{ required: true, message: "Please input database server name!" }]}>
                            <StyledInput  />
                        </StyledFormItem>
                    </Col>
                </Row>

                <Row gutter={12}>
                    <Col span={12}>
                        <StyledFormItem name="DBName" label="Database Name" rules={[{ required: true, message: "Please input database name!" }]}>
                            <StyledInput  />
                        </StyledFormItem>
                    </Col>
                    <Col span={12}>
                        <StyledFormItem name="DBUsername" label="Database Username" rules={[{ required: true, message: "Please input database user name!" }]}>
                            <StyledInput  />
                        </StyledFormItem>
                    </Col>
                    
                </Row>

                
            </Form>
                
            </ Drawer>
        </Container>
    );
}

export default EmailAddressForm