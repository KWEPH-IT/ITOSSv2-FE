import { useEffect, useState } from 'react'
import MainLayout from '../../MainLayout'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom';
import { Container, StyledInput, StyledSelect, AddButton } from "../../../components/StyledComponents";
import { Form, Row, Col, Button, Space, message, Popconfirm, Modal, Select } from 'antd';
import { StyledTable } from '../../../components/StyledTable';
import { ColumnsType } from 'antd/es/table';
import { MemberProps } from '../../../types/GroupMembers_drawer';
import { useGroupMembers } from '../../../hooks/configuration/groupMember_hooks';
import { Loader } from '../../../components/Loader';
import { DeleteOutlined, UserAddOutlined } from "@ant-design/icons";
import API from '../../../api/api';
import { getEmailAddress } from '../../../hooks/configuration/emailAddress_hooks';
import { EmailAddressProps } from '../../../types/EmailAddress_drawer';


const GroupEmailMember = () => {
    const { ge } = useParams();
    const decoded_ge = ge ? atob(ge) : "";

    const { members, loading, refetch} = useGroupMembers(decoded_ge);
    const [ filteredCols, setFilteredCols ] = useState<MemberProps[]>([]);
    const [ UpdatingId, setUpdatingId ] = useState<number | null>(null);
    const [ form ] = Form.useForm()
    const [ searchForm ] = Form.useForm()
    const [ openModal, setOpenModal ] = useState(false);
    const [ isloading, setLoading ] = useState(false);
    const { email } = getEmailAddress();
    const [selectedEmployee, setSelectedEmployee] = useState<EmailAddressProps | undefined>(undefined);


    useEffect(() => {
        if (openModal) {
            if (selectedEmployee) {
            form.setFieldsValue({
                Department: selectedEmployee.Department,
                EmployeeId: selectedEmployee.EmployeeId,
                EmailAddress: selectedEmployee.EmailAddress,
                
            });
            } else {
                form.resetFields();
            }
        }
        else{
            setSelectedEmployee(undefined);
        }
    }, [openModal, selectedEmployee, form]);
    

    const handleSelect = (value: string) => {
        const emails = email.find(
          (emp: EmailAddressProps) => emp.EmployeeId === value
        );
        setSelectedEmployee(emails);
      };
  
    const handleSave = async(payload : any) => {
        try{
            setLoading(true);
            const finalPayload = {
                ...payload,
                GroupEmail: decoded_ge
            }

            const response = await API.post(`/api/CreateGroupMember`, finalPayload);
  
            if (response.status === 200){
                message.success(response.data.message);
            }
            else{
                message.error(response.data.message);
            }
        }
        catch(error : any){
            if(error.response?.status === 409){
                message.warning(error.response.data.message || "Member already exists.");
            }else{
                message.error("An unexpected error occured.")
            }
        }
        finally{
            setOpenModal(false)
            setLoading(false)
            form.resetFields()
            await refetch()
        }
    }

    // Example: delete member by SystemId
    const delMember = async (systemId: number) => {
        try {
            setLoading(true);
            setUpdatingId(systemId);

            const response = await API.delete(`/api/delMember/${systemId}`);

            if (response.status === 200){
                message.success(response.data.message);
            }
            else{
                message.error(response.data.message);
            }
        } catch (err: any) {
            console.error(err);
            message.error(err.message || 'Error removing member');
        } finally {
            // clear loading state
            setUpdatingId(null);
            setLoading(false);
            await refetch();
            searchForm.resetFields();
            setFilteredCols([]);  
        }
    };

    const columns: ColumnsType<MemberProps> = [
        {
            title: 'Full Name',
            dataIndex: 'FullName',
            key: 'FullName',
        },
        {
            title: 'Email Address',
            dataIndex: 'EmailAddress',
            key: 'EmailAddress',
        },
        {
            title: 'Department',
            dataIndex: 'Department',
            key: 'Department',
        },
        {
            title: 'Type',
            dataIndex: 'Type',
            key: 'Type',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: any) => (
              <Popconfirm
                title="Are you sure you want to remove this member?"
                onConfirm={() => delMember(record.SystemId)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="link"
                  size="small"
                  loading={UpdatingId === record.SystemId}
                >
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
            )
          }
          
    ];

    const handleSearching = (values : any) => {
        const data = members.filter((item : MemberProps) => {
            return (
                (!values.FullName || item.FullName?.toLowerCase().includes(values.FullName.toLowerCase())) &&
                (!values.Department || item.Department?.toLowerCase().includes(values.Department.toLowerCase())) &&
                (values.Status === undefined || item.Type === values.Type)
            );
        });
        setFilteredCols(data);
    }

    const clearfields = () => {
        searchForm.resetFields();
        setFilteredCols(members);
    }

    useEffect(() => {
        if (decoded_ge) {
          refetch(); // This is the actual function to reload data
        }
      }, [decoded_ge]);

    useEffect(() => {
        setFilteredCols(members);
    }, [members]);

      
    if (loading) return <Loader></Loader>

  return (
    <MainLayout title={
        <>
          Configuration &gt;{' '}
          <Link to="/configGroupEmails" style={{ textDecoration: 'underline' }}>
            Group Emails
          </Link>{' '}
          &gt; Members
        </>
      }
    >
        <Container>

            <p style={{ textAlign: 'center', fontSize: '16px', letterSpacing: '0.7px', fontWeight: 600, color: '#000'}}> {decoded_ge}</p>

 
            <div style={{ maxWidth: '100%', margin: '0 auto', padding: '30px', alignItems: 'center' }}>
                <Form layout="vertical" form={searchForm} onFinish={handleSearching}>
                    <Row justify="center" gutter={[16, 16]} align="bottom">
                        <Col xs={24} sm={12} md={4}>
                            <Form.Item label="Full Name" name="FullName">
                                <StyledInput placeholder="Search by Full Name" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Form.Item label="Department" name="Department">
                                <StyledInput placeholder="Search by Department" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Form.Item label="Type" name="Type">
                                <StyledSelect 
                                options={[ 
                                    {value : "Member", label: 'Member'},
                                    {value : "Owner", label: 'Owner'}
                                ]} />
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
                {/*  */}
                <AddButton type="primary" onClick={() => setOpenModal(true)}> <UserAddOutlined/> ADD MEMBER  </AddButton>
            </div>
            <StyledTable<MemberProps> columns={columns} data={filteredCols} rowKey='SystemId'></StyledTable>
     
        </Container>

        <Modal title={<p className="modal-config-title">Add New Member</p>} loading={isloading} open={openModal} onCancel={ () => setOpenModal(false)} footer={null}>
        <Form
                layout="vertical"
                onFinish={handleSave}
                form={form}
            >
                <Form.Item
                    name="EmployeeId"
                    label="Select Employee"
                    rules={[{ required: true, message: "Please select an employee" }]}
                    >
                    <Select
                        placeholder="Select Employee"
                        allowClear
                        onChange={handleSelect}
                    >
                        {email?.map((emp: EmailAddressProps) => (
                        <Select.Option
                            key={emp.EmployeeId}
                            value={emp.EmployeeId}
                            label={emp.EmailAddress}
                            style={{ fontSize: "13px", fontWeight: "600" }}
                        >
                            {emp.EmployeeId} - {emp.EmailAddress}
                        </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Department"
                    name="Department"
                >
                    <StyledInput readOnly />
                </Form.Item>

                <Form.Item
                    label="Employee ID"
                    name="EmployeeId"
                >
                    <StyledInput readOnly />
                </Form.Item>

                <Form.Item
                    label="Email Address"
                    name="EmailAddress"
                    rules={[
                        { required: true, message: "Email address is required" },
                        { type: "email", message: "Please enter a valid email" }
                    ]}
                >
                    <StyledInput readOnly />
                </Form.Item>

                <Form.Item label="Type" name="Type"
                    rules={[
                        { required: true, message: "Type is required" },
                    ]}
                
                >
                    <StyledSelect 
                    options={[ 
                        {value : "Member", label: 'Member'},
                        {value : "Owner", label: 'Owner'}
                    ]} />
                </Form.Item>

                <Button type="primary" htmlType="submit" block loading={isloading}>Save Member</Button>
            </Form>
            
            
        </Modal>
    </MainLayout>
  )
}

export default GroupEmailMember