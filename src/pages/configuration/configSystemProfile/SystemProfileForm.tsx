import React, { useState, useEffect } from 'react'
import { Drawer, Space, Button, Form, Row, Col, Select,  Input, message, Alert, Card, TimePicker, InputNumber } from "antd";
import { Container, SubmitButton, StyledFormItem, StyledInput, StyledSelect } from "../../../components/StyledComponents";
import { Loader } from '../../../components/Loader';
import {  SaveOutlined } from "@ant-design/icons";
import { DrawerProps } from '../../../types/Drawer';
import API from '../../../api/api';
import { SystemProfileProps } from '../../../types/SystemProfile_drawer';
import dayjs from "dayjs";


const { TextArea } = Input;

const SystemProfileForm: React.FC<DrawerProps & { record?: SystemProfileProps | null }> = ({isDrawerOpen, drawerMode, closeDrawer, onUserAction, record}) => {
  const [ form] = Form.useForm();
  const [ loading, isloading ] = useState(false); 
  const [isSubmit, setSubmit] = useState(false);

  // watch when drawerMode or record changes
    useEffect(() => {
        if (drawerMode === "edit" && record) {
        form.setFieldsValue({
            ...(record ?? {}),
            Status: Number(record?.Status), // ensure it's 1 or 0
            ScheduleTime: record.ScheduleTime
            ? dayjs(record.ScheduleTime, "HH:mm:ss")
            : null,
            ScheduleType: record.ScheduleType || "Monthly"
        });
        } else {
            form.resetFields();
            form.setFieldsValue({
                Status: 1, // default Active for new
                ScheduleType: "Monthly",
            });
        }
    }, [drawerMode, record, form]);

  const onFinish = async(payload : any) =>{
    setSubmit(true);
    try{
        if (drawerMode === "add"){
            isloading(true);
            const response = await API.post(`/api/CreateSystemPro`, payload);
            
            if (response.status === 200){
                message.success("Profile successfully added!");
                form.resetFields();
                closeDrawer();
                onUserAction();
            }
            else{
                message.error(response.data.mesage);
            }
        }
        else{
            isloading(true);
            // include record ID if needed
            const payloadWithId = { ...record, ...payload,  
                ScheduleTime: payload.ScheduleTime
                ? payload.ScheduleTime.format("HH:mm:ss")
                : null };

            console.log(payloadWithId);
            const response = await API.put(`/api/UpdateSystemPro`, payloadWithId);
            
            if (response.status === 200){
                message.success("Profile successfully updated!");
                form.resetFields();
                closeDrawer();
                onUserAction();
            }
            else{
                message.error(response.data.mesage);
            }
        }
    }
    catch(er){
        console.error("Error saving:", er);
        message.error("Error saving... Please try again.");
    }
    finally{
        form.resetFields()
        setSubmit(false)
        isloading(false);
    }
  }

  if (loading){<Loader></Loader>}
  return (
    <Container>
        <Drawer
            title={drawerMode === "add" ? "Add New System Profile" : "Edit System Profile"}
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
            <Form form={form} onFinish={onFinish} layout='vertical' >
                <Row gutter={12}>
                    <Col span={12}>
                        <StyledFormItem name="SystemName" label="System Name" rules={[{ required: true, message: "Please input system name!" }]}>
                            <StyledInput  />
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
                        { drawerMode === "add" ?
                            (
                            <StyledFormItem label="Status" >
                                <Alert message="Active" type="success" showIcon />
                            </StyledFormItem>
                            ) :
                            (
                                <StyledFormItem name="Status" label="Status" >
                                    <StyledSelect 
                                    options={[
                                        {value: 1, label: 'Active'},
                                        {value: 0, label: 'Inactive'},
                                    ]}     />
                                </StyledFormItem>
                            )
                        }
                    </Col>
                </Row>

                <Row>
                    <Col span={24}>
                        <StyledFormItem name="Remarks" label="Remarks" >
                            <TextArea  rows={2} />
                        </StyledFormItem>
                    </Col>
                </Row>


                {/* DATABASE INFORMATON */}
                <Card variant='borderless' >
                    <p style={{ fontWeight: 600, letterSpacing: 0.7, fontSize: 13,color: "#1677ff" }}> Database Details </p>
                    
                    <Row>
                        <Col span={12}>
                            <StyledFormItem name="DBServerName" label="Database Server Name" rules={[{ required: true, message: "Please input database server name!" }]}>
                                <StyledInput  />
                            </StyledFormItem>
                        </Col>
                        <Col span={12}>
                            <StyledFormItem name="DBName" label="Database Name" rules={[{ required: true, message: "Please input database name!" }]}>
                                <StyledInput  />
                            </StyledFormItem>
                        </Col>
                    </Row>


                    <Row gutter={12}>
                       
                        <Col span={12}>
                            <StyledFormItem name="DBUsername" label="Database Username" rules={[{ required: true, message: "Please input database user name!" }]}>
                                <StyledInput  />
                            </StyledFormItem>
                        </Col>
                        <Col span={12}>
                            <StyledFormItem name="DBPassword" label="Database Password" rules={[{ required: true, message: "Please input database password!" }]}>
                                <StyledInput  />
                            </StyledFormItem>
                        </Col>
                        
                    </Row>

                    <Row gutter={12}>
                       
                        <Col span={12}>
                            <StyledFormItem name="DBType" label="Database Type" rules={[{ required: true, message: "Please input database name!" }]}>
                            <Select  placeholder="Please select Database Type">
                                <Select.Option value="MSSQL">MSSQL</Select.Option>
                                <Select.Option value="MySQL">MySQL</Select.Option>
                            </Select>
                            </StyledFormItem>
                        </Col>
                        <Col span={6}>
                            <StyledFormItem name="DBTableName" label="Database Table Name" >
                                <StyledInput  />
                            </StyledFormItem>
                        </Col>
                        <Col span={6}>
                            <StyledFormItem name="DBTableIdentifier" label="Database Table Identifier" >
                                <StyledInput  />
                            </StyledFormItem>
                        </Col>
                       
                    </Row>

                    <Row gutter={12}>
                        
                        <Col span={12}>
                            <StyledFormItem name="DBPasswordColName" label="Database Password Column Name" >
                                <StyledInput  />
                            </StyledFormItem>
                        </Col>
                        <Col span={12}>
                            <StyledFormItem name="DBStatusColName" label="Database Status Column Name" >
                                <StyledInput  />
                            </StyledFormItem>
                        </Col>
                       
                    </Row>
                    <Row gutter={12}>
                        
                        <Col span={24}>
                            <StyledFormItem name="FieldsToRemove" label="Fields not to import" >
                                <TextArea  rows={2}/>
                            </StyledFormItem>
                        </Col>
                    </Row>
                    
                </Card>

                <Card variant='borderless' >
                    <p style={{ fontWeight: 600, letterSpacing: 0.7, fontSize: 13,color: "#1677ff" }}> Backup Settings </p>
                    <Row gutter={12}>
                        <Col span={12}>
                            <StyledFormItem name="SourceCodePath" label="Source Code Path" >
                                <StyledInput  />
                            </StyledFormItem>
                        </Col>

                        <Col span={12}>
                            <StyledFormItem name="BackupPath" label="Backup Path" >
                                <StyledInput  />
                            </StyledFormItem>
                        </Col>
                    </Row>

                    <Row gutter={12}>
                        <Col span={12}>
                            <StyledFormItem name="ScheduleType" label="Schecule Type" >
                                <StyledInput value="Monthly" readOnly />
                            </StyledFormItem>
                        </Col>

                        <Col span={6}>
                            <StyledFormItem name="BackupDay" label="Backup Day" >
                                <InputNumber  min={1} max={28}  style={{fontSize: 12, width: "100%"}}/>
                            </StyledFormItem>
                        </Col>

                        <Col span={6}>
                            <StyledFormItem name="ScheduleTime" label="Schedule Time" >
                                <TimePicker style={{fontSize: 12, width: "100%"}} />
                            </StyledFormItem>
                        </Col>
                    </Row>
                </Card>

            </Form>

        </Drawer>
    </Container>
  )
}

export default SystemProfileForm