import React, { useState, useEffect } from 'react'
import { Drawer, Space, Button, Form, Row, Col,  message, Alert } from "antd";
import { Container, SubmitButton, StyledFormItem, StyledInput, StyledSelect } from "../../../components/StyledComponents";
import {  SaveOutlined } from "@ant-design/icons";
import { DrawerProps } from '../../../types/Drawer';
import API from '../../../api/api';
import { GroupEmailProps } from '../../../types/GroupEmails_drawer';

const GroupEmailForm: React.FC<DrawerProps & {record?: GroupEmailProps | null}> = ({isDrawerOpen, drawerMode, closeDrawer, onUserAction, record}) => {
  const [ form ] = Form.useForm();
  const [ loading, isloading ] = useState(false);
  const [ isSubmit, setSubmit ] = useState(false);

  useEffect(() => {
    if (drawerMode === "edit" && record){
      form.setFieldsValue({
        ...(record ?? {}),
        Status: Number(record?.Status),
      });
    }
    else{
      form.resetFields()
      form.setFieldsValue({
        Status: 1,
      })
    }
  },[drawerMode, record, form])


  const onFinish = async(payload: any) => {
    setSubmit(true);
    try{
        if (drawerMode === "add"){
          console.log("Adding");
          isloading(true);
          const response = await API.post(`/api/CreateGroupEmail`, payload);

          if (response.status === 200){
            message.success(response.data.mesage);
            form.resetFields()
            closeDrawer();
            onUserAction()
          }
          else{
            message.error(response.data.mesage);
          }
        }
        else {
          isloading(true);
          // include record ID if needed
          const payloadWithId = { ...record, ...payload };

          //console.log(payloadWithId);
          const response = await API.put(`/api/UpdGroupEmail`, payloadWithId);
          
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
    catch(error){
        console.error("Error saving:", error);
        message.error("Error saving... Please try again.");
    }
    finally{
        form.resetFields()
        setSubmit(false)
        isloading(false);
    }
  }

  return (
    <Container>
      <Drawer
        title={drawerMode === 'add' ? 'Create New Group Email' : 'Edit Group Email'}
        placement='right'
        width={1000}
        onClose={closeDrawer}
        open={isDrawerOpen}
        extra={
          <Space>
              <Button onClick={closeDrawer} >Cancel</Button>
              <SubmitButton type="primary" loading={isSubmit} onClick={()=> form.submit()} htmlType="submit" > 
              <SaveOutlined /> Submit
              </SubmitButton>
          </Space>
        }
      >
        <Form onFinish={onFinish} initialValues={drawerMode === "edit" ? { ...(record ?? {}), Status: record?.Status } : { Status: 1 } } form={form}  layout='vertical' >
          <Row gutter={12}>
              <Col span={12}>
                  <StyledFormItem name="GroupName" label="Group Name" rules={[{ required: true, message: "Please input group name!" }]}>
                      <StyledInput  />
                  </StyledFormItem>
              </Col>
              <Col span={12}>
                  <StyledFormItem name="GroupEmail" label="Group Email" rules={[{ required: true, message: "Please input group email!" }]}>
                      <StyledInput  />
                  </StyledFormItem>
              </Col>
          </Row>

          <Row gutter={12}>
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

      </Form>



      </Drawer>
    </Container>
  )
}

export default GroupEmailForm