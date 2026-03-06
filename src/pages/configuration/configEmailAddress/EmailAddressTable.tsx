import { useEffect, useState } from 'react'
import { StyledTable } from '../../../components/StyledTable'
import { Container, StyledInput, StyledSelect, StyledDatePicker, SearchContainer, AddButton } from "../../../components/StyledComponents";
import { Row, Col, Form, Space, Button, Tag, message } from 'antd';
import { EmailAddressProps } from '../../../types/EmailAddress_drawer';
import type { ColumnsType } from "antd/es/table";
import { getEmailAddress } from '../../../hooks/configuration/emailAddress_hooks';
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
import { Loader } from '../../../components/Loader';
import { EditTwoTone, AppstoreAddOutlined } from "@ant-design/icons";
import API from '../../../api/api';

const { RangePicker } = StyledDatePicker;

const EmailAddressTable = ({onAddUserClick, shouldRefresh} : {onAddUserClick: () => void, shouldRefresh: number}) => {
    const { email, loading, refetch } = getEmailAddress();
    const [ filteredCols, setFilteredCols ] = useState<EmailAddressProps[]>([]);
    const [ toeditId, setToeditId] = useState<number | null>(null);
    const [ updatingId, setUpdatingId] = useState<number | null>(null);
    const [ updatedData, setUpdatedData ] = useState<Partial<EmailAddressProps>>({});
    const [ searchForm ] = Form.useForm();
    const [ form ] = Form.useForm()

    const saveEdit = async(id : number) => {
        try {
            const values = await form.validateFields();
            // you can narrow down only the needed fields from the form if you like
            const payload = {
              ...values,
              Date_Created: values.Date_Created ? dayjs(values.Date_Created).format("YYYY-MM-DD") : null,
              Date_Deleted: values.Date_Deleted ? dayjs(values.Date_Deleted).format("YYYY-MM-DD") : null,
            };

            setUpdatingId(id);
            const response = await API.put(`/api/updEmail/${id}`, payload);
            if (response.status === 200) {
              message.success("Email details updated successfully!");
              refetch();
            }
          } catch (err: any) {
            message.error("Something went wrong: " + err.message);
          } finally {
            setUpdatingId(null);
            cancelEdit();
        }
    }

    const columns: ColumnsType<EmailAddressProps> = [
        { title: 'Employee Id', dataIndex: 'EmployeeId', key: 'EmployeeId' },
        { title: 'Employee Name', dataIndex: 'FullName', key: 'FullName' },
        { 
            title: 'Email Address', 
            dataIndex: 'EmailAddress', 
            key: 'EmailAddress',
            render: (text, record: EmailAddressProps) =>
                toeditId === record.SystemId ? (
                    <Form.Item name='EmailAddress' 
                        rules={[{ required : true}]}>
                        <StyledInput></StyledInput>
                    </Form.Item>
                ):(
                    text
                )
        },
        { 
            title: 'Date Created', 
            dataIndex: 'Date_Created', 
            key: 'Date_Created', 
            render: (value: string | null, record: EmailAddressProps) =>
                toeditId === record.SystemId ? (
                  <Form.Item
                    name="Date_Created"
                    rules={[{ required: true, message: 'Please select a date!' }]}
                  >
                    <StyledDatePicker format="YYYY-MM-DD" />
                  </Form.Item>
                ) : (
                  value ? dayjs(value).format('YYYY-MM-DD') : ''
                ),
        },
        { title: 'Date Resigned', dataIndex: 'Date_Resigned', key: 'Date_Resigned', render: (value: string | null) => value ? dayjs(value).format('YYYY-MM-DD') : '', },
        { 
            title: 'Date Deleted', 
            dataIndex: 'Date_Deleted', 
            key: 'Date_Deleted', 
            render: (value: string | null, record: EmailAddressProps) =>
                toeditId === record.SystemId ? (
                  <Form.Item
                    name="Date_Deleted"
                  >
                    <StyledDatePicker format="YYYY-MM-DD" />
                  </Form.Item>
                ) : (
                  value ? dayjs(value).format('YYYY-MM-DD') : ''
                ),
        },

        { 
            
            title: 'Status',
            dataIndex: 'Status',
            key: 'Status',
            render: (_: any, record: EmailAddressProps) => {
                return toeditId === record.SystemId ? (
                <Form.Item
                    name="Status"
                    rules={[{ required: true, message: 'Please select a status' }]}
                >
                    <StyledSelect
                    value={(updatedData?.Status ?? record.Status)?.toString()}
                    //onChange={(value) => handleFieldChange('Status', value)}
                    
                    options={[ 
                        {value : "Active", label: 'Active'},
                        {value : "For Deletion", label: 'For Deletion'},
                        {value : "Deleted", label: 'Deleted'}
                    ]} 
                    />
                    
                </Form.Item>
                ) : (
                record.Status === 'For Deletion' ? (
                    <Tag color="orange">For Deletion</Tag>
                ) : record.Status === 'Deleted' ? (
                    <Tag color="red">Deleted</Tag>
                ) : (
                    <Tag color="green">Active</Tag>
                )
                );
            },
        },
    
        {
            title: 'Actions',
            key: 'actions',
            render: (_:any, record: EmailAddressProps) => toeditId === record.SystemId ?
            (
                <Space>
                    <Button type="primary" size="small" htmlType="submit" loading={updatingId === record.SystemId} onClick={() => saveEdit(record.SystemId)} >Save</Button>
                    <Button danger size="small" onClick={cancelEdit}>Cancel</Button>
                </Space>
            ) : (
                <Button type='link' size='small' onClick={() =>handleEdit(record)}><EditTwoTone></EditTwoTone></Button>
            )
        }
    ]

    const handleEdit = (record: EmailAddressProps) => {
        setToeditId(record.SystemId);
        setUpdatedData({...record});
        form.setFieldsValue({
            EmailAddress : record.EmailAddress,
            Date_Created : record.Date_Created ? dayjs(record.Date_Created) : null,
            Date_Deleted : record.Date_Deleted ? dayjs(record.Date_Deleted) : null,
            Status : record.Status,
        })
    }

    const cancelEdit = () => {
        setUpdatedData({});
        setToeditId(null);
    }

    // ✅ REFRESH when shouldRefresh changes
    useEffect(() => {
        if (shouldRefresh) {
          refetch();
        }
      }, [shouldRefresh]); // 👈 watch shouldRefresh only

    const handleSearching = (values : any) => {
        const data = email.filter((item: EmailAddressProps) => {
            const matchEmail =
              !values.EmailAddress ||
              item.EmailAddress?.toLowerCase().includes(values.EmailAddress.toLowerCase());
        
            const matchEmployeeId =
              !values.EmployeeId ||
              item.EmployeeId?.toLowerCase().includes(values.EmployeeId.toLowerCase());
        
            const matchStatus =
              !values.Status ||
              item.Status?.toLowerCase().includes(values.Status.toLowerCase());
        
              const matchDateCreated =
              !values.Date_Created ||
              (Array.isArray(values.Date_Created) &&
                dayjs(item.Date_Created).isBetween(
                  dayjs(values.Date_Created[0]).startOf("day"),
                  dayjs(values.Date_Created[1]).endOf("day"),
                  null,
                  "[]"
                ));
        
            return matchEmail && matchEmployeeId && matchStatus && matchDateCreated;
          });
        
        setFilteredCols(data);
    }

    


    useEffect(() =>{
        if(email){
            setFilteredCols(email)
        }
   }, [email])


    const clearfields = () => {
        searchForm.resetFields();
        setFilteredCols(email);
    }
   



    if (loading) return <Loader></Loader>

  return (
    <Container>
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '30px', alignItems: 'center' }}>
            <Form layout="vertical" form={searchForm} onFinish={handleSearching}>
                <Row justify="center" gutter={[16, 16]} align="bottom">
                    <Col xs={24} sm={12} md={4}>
                        <Form.Item label="Email Address" name="EmailAddress">
                            <StyledInput placeholder="Search by Email Address" allowClear />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Form.Item label="Employee ID" name="EmployeeId">
                            <StyledInput placeholder="Search by Employee ID" allowClear />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Form.Item label="Status" name="Status">
                            <StyledSelect 
                            options={[ 
                                {value : 'Active', label: 'Active'},
                                {value : 'For Deletion', label: 'For Deletion'},
                                {value : 'Deleted', label: 'Deleted'}
                            ]} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Form.Item label="Date Created" name="Date_Created">
                            <RangePicker />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={4}>
                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit" style={{ marginTop: 30 }}>
                                    Search
                                </Button>

                                <Button type="default"  style={{ marginTop: 30 }} onClick={() => clearfields()}>
                                    Clear
                                </Button>
                            </Space>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: 10 }}>
            <AddButton type="primary" onClick={onAddUserClick}> <AppstoreAddOutlined/> ADD EMAIL PROFILE  </AddButton>
        </div>
        <Form form={form} >
            <StyledTable<EmailAddressProps> columns={columns} data={filteredCols} rowKey='SystemId'></StyledTable> 
        </Form>
    </Container>
  )
}

export default EmailAddressTable