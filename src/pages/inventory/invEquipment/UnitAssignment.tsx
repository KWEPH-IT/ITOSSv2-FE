import { useState, useMemo } from 'react'
import { Container, StyledInput, StyledSelect } from '../../../components/StyledComponents'
import { Row, Col, Card, Tag, message, Avatar, Typography, Space, Form, DatePicker, Button, Popconfirm } from 'antd'
import { StyledTable } from '../../../components/StyledTable';
import { getAllEquipment } from '../../../hooks/inventory/equipmentInv_hooks';
import type { ColumnProps } from 'antd/es/table';
import type { EquipmentInvProps } from '../../../types/EquipmentInv_drawer';
import { Loader } from '../../../components/Loader';
import { UsergroupAddOutlined, InboxOutlined, UserOutlined, DeleteOutlined }  from "@ant-design/icons";
import { getEmployees } from '../../../hooks/configuration/vwAtKWE_hooks';
import { vwAtKWEProps } from '../../../types/vwAtKWE_drawer';
import API from '../../../api/api';
import { formatDate } from '../../../utils/dateFormatter';

const { Title, Text } = Typography


const UnitAssignment = () => {
    const { equipment: rawEquipment, loading, refetch } = getAllEquipment();
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
    const fetchAllEquipment = rawEquipment ?? [];
    const { employees, loading : HRISloading } = getEmployees();
    const [ form ] = Form.useForm();
    const [ search, setSearch ] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState<vwAtKWEProps | null>(null);
    const [messageApi, contextHolder] = message.useMessage();

   
    const availableEquipment = useMemo(() => {
        return fetchAllEquipment.filter(
          (item: EquipmentInvProps) => item.Status === "Available"
        );
      }, [fetchAllEquipment]);
      
      const filtered = useMemo(() => {
        const value = search.toLowerCase();
      
        return availableEquipment.filter((i: EquipmentInvProps) => (
          i.EqType?.toLowerCase().includes(value) ||
          i.SerialNumber?.toLowerCase().includes(value) ||
          i.AssetTag?.toLowerCase().includes(value)
        ));
      }, [availableEquipment, search]);

      const assignedToEmployee = (rawEquipment ?? []).filter(
        (item: EquipmentInvProps) =>
          item.Status === "Assigned" &&
          item.EmployeeId === selectedEmployee?.EmployeeId
      );



      const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
      };

    const columns: ColumnProps<EquipmentInvProps>[] = [
        {
            title: "Equipment",
            dataIndex: 'EqType',
            key: 'EqType'
        },

        {
            title: 'Serial Number',
            dataIndex: 'SerialNumber',
            key: 'SerialNumber'
        },

        {
            title: 'Asset Tag',
            dataIndex: 'AssetTag',
            key: 'AssetTag'
        },

        { 
            title: "Status", 
            render: (_:any, record: EquipmentInvProps) => {
                return (
                    <Tag 
                    color={record.Status === "Assigned" ? 'cyan' :
                            record.Status === "Available" ? 'green' : 'red'}>
                            { record.Status === "Assigned" ? 'Assigned' : 
                            record.Status === "Available" ? 'Available' : 'Disposed' } </Tag>
                )
            }
        },
    ]

    const selectedItems = fetchAllEquipment.filter((item : EquipmentInvProps)=>
        checkedKeys.includes(item.SerialNumber)
      );
    
    const rowSelection = {
        selectedRowKeys: checkedKeys,
        preserveSelectedRowKeys: true, // ✅ keeps selection across search/filter
        onChange: (selectedRowKeys: React.Key[]) => {
            setCheckedKeys(selectedRowKeys as string[]);
        },
        getCheckboxProps: (record: EquipmentInvProps) => ({
            disabled: record.Status !== 'Available',
        }),
    };

    const handleRelease = async(serial : string) => {
        try{
            const response = await API.put(`/api/relEquip/${serial}`);
            if (response.status == 200){
                messageApi.success({
                    content: 'Equipment released successfully',
                    duration: 5,
                  });
              
                  // Allow message to paint before refetch
                  setTimeout(() => {
                    refetch();
                  }, 1000);
            }
        }
        catch(err){
            message.error('Failed to release equipment ' + err)
        }
    }

    const assignUnit = async(values : any) => {
        try{
            const payload = {
                items: selectedItems.map((item: EquipmentInvProps) => ({
                    serial: item.SerialNumber,
                    assetTag: item.AssetTag,
                    eqType: item.EqType,
                    model: item.Model,
                    brand: item.Brand
                })),
                EmployeeId: selectedEmployee?.EmployeeId,
                DeptHeadId: selectedEmployee?.DeptHeadId,
                dateAssigned: formatDate(values.Year_Issued),
            }

            // console.log(payload);
            const response = await API.post('/api/AssignUnit', payload);
            if (response.status == 200){
                messageApi.success({
                    content: 'Equipment assigned successfully!',
                    duration: 5,
                });
                //setSelectedEmployee(null);
                setCheckedKeys([]);
                form.resetFields(['Year_Issued']);
            
                // Allow message to paint before refetch
                setTimeout(() => {
                    refetch();
                }, 1000);
            }
        }
        catch(err){
            message.error('Failed to assign equipment ' + err)
        }
        
    }


if (loading || HRISloading) return <Loader></Loader>
return (
    <Container>
        {contextHolder}
        <Row gutter={[16,16]}>
            <Col xs={24} md={16} lg={14} xxl={18}>
                <Row gutter={[16,16]} wrap>
                    <Col xs={24} sm={18} md={20} lg={20} xxl={22}>
                        <StyledInput value={search} placeholder='Search Equipment ...' style={{ height: 35}} onChange={handleSearch}>

                        </StyledInput>
                    </Col>
                    <Col xs={24} sm={6} md={4} lg={2} xxl={2}>
                        <Tag color="default" style={{ height: 35, alignContent:'center', fontWeight: 600}}>
                            { checkedKeys.length  } Selected
                        </Tag>
                    </Col>
                </Row>

                <Row gutter={[16,16]} style={{ marginTop: 20}}>
                    <Col span={24}>
                        <StyledTable<EquipmentInvProps> size="small" rowSelection={rowSelection} columns={columns} data={filtered} rowKey='SerialNumber'  scroll={{ x: 800 }} />
                    </Col>
                </Row>
            </Col>

            <Col xs={24} md={8} lg={10} xxl={6}>
                <Card className='assignment-card'>
                    <Row align="middle" gutter={12} style={{ marginBottom: 24 }}>
                        {/* Icon Box */}
                        <Col>
                            <Avatar
                            style={{
                                backgroundColor: '#1e293b', // Tailwind slate-900
                                width: 40,
                                height: 40,
                                borderRadius: 12, // rounded-xl
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            icon={<UsergroupAddOutlined style={{ color: '#fff', fontSize: 20 }} />}
                            />
                        </Col>

                        {/* Text Content */}
                        <Col>
                            <Title level={5} style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>
                            Assignment Panel
                            </Title>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                            {checkedKeys.length} item(s) selected
                            </Text>

                        </Col>
                    </Row>

                    <Form layout='vertical' form={form} onFinish={assignUnit}>
                        <Row>
                            <Col span={24}>
                                <Form.Item label="Assigned To" name="EmployeeId" rules={[{ required: true }]}>
                                    <StyledSelect
                                        showSearch
                                        optionFilterProp="label"
                                        placeholder="Please select Employee Name"
                                        optionLabelProp="label"
                                        onChange={(_, option: any) => {
                                            setSelectedEmployee(option.employee);
                                          }}
                                    >
                                    {employees?.map((emp: vwAtKWEProps) => (
                                        <StyledSelect.Option
                                            key={emp.EmployeeId}
                                            value={emp.EmployeeId}
                                            label={emp.FullName}
                                            employee={emp}
                                            style={{ fontSize: "13px", fontWeight: "600" }}
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
                                                <span style={{ fontWeight: 600 }}>{emp.FullName}</span>
                                                <span style={{ fontSize: 12, color: "#888", fontWeight: 300 }}>{emp.EmployeeId} • {emp.Department} </span>
                                                </div>
                                            </div>
                                        </StyledSelect.Option>
                                    ))}
                                    </StyledSelect>
                                </Form.Item>
                            </Col>
                            
                            { selectedEmployee ? (
                                <Col span={24}> 
                                    <Card style={{ border: "none", backgroundColor: "#E6F0FF", marginBottom: 20 }}>
                                        <Row>
                                            <Col>
                                                <Text type="secondary" style={{ fontSize: '12px' }}> Assigned equipment/s:</Text>
                                                <ul>
                                                {assignedToEmployee.map((item: EquipmentInvProps) => (
                                                    <li
                                                    key={item.SerialNumber}
                                                    style={{
                                                    position: 'relative',
                                                    fontSize: 12,
                                                    marginBottom: 2,
                                                    paddingRight: 60, // space for the button
                                                    }}
                                                >
                                                    <span>
                                                    <strong>{item.EqType}</strong> - {item.SerialNumber}
                                                    </span>
                                                    <Popconfirm
                                                        title="Item Releasing"
                                                        description="Are you sure to release this item?"
                                                        onConfirm={() => handleRelease(item.SerialNumber)}
                                                        // onCancel={cancel}
                                                        okText="Yes"
                                                        cancelText="No"
                                                    >
                                                        <Button
                                                        type="link"
                                                        size="small"
                                                        danger
                                                        style={{ position: 'absolute', right: 0, top: 0, padding: 0, height: 'auto' }}
                                                        >
                                                        <DeleteOutlined />
                                                        </Button>
                                                    </Popconfirm>
                                                </li>
                                                ))}
                                                </ul>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            ) : (
                                <></>
                            )
                            }
                        </Row>

                    { checkedKeys.length === 0 ? (
                        <Row align="middle" justify="center" gutter={12} style={{ marginTop: 80 }}>
                            <Space direction="vertical" align="center" size={8}>
                                <Avatar
                                style={{
                                    backgroundColor: '#dadada',
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                icon={<InboxOutlined style={{ color: '#fff', fontSize: 20 }} />}
                                />
                                <Text type="secondary">Select equipment from the list to assign</Text>
                            </Space>
                        </Row>
                        ) : (
                        <Row gutter={[16,16]}>
                            <Col span={24}>
                                <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                                    <Col span={24}>
                                        <Card style={{ border: "none", backgroundColor: "#F8F8F8", marginBottom: 20 }}>
                                            <Row>
                                                <Col>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}> Selected equipment/s:</Text>
                                                    <ul>
                                                        {selectedItems.map((item: EquipmentInvProps )=> (
                                                            <li key={item.SerialNumber} style={{ fontSize: '12px' }}>
                                                            <strong> {item.EqType} </strong> - {item.SerialNumber}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item label="Date Assigned" name="Year_Issued" rules={[{ required: true }]}>
                                            <DatePicker style={{ width: '100%' }}></DatePicker>
                                        </Form.Item>
                                    </Col>

                                    <Button  block htmlType='submit'  style={{ backgroundColor: "#000", color: "#FFF", height: "35px", letterSpacing: 0.7, fontWeight: 600 }}> Assign { checkedKeys.length } item/s </Button>
                                </Row>
                            </Col>
                        </Row>
                        ) 

                    }
                    </Form>
                    

                </Card>
            
            </Col>
        </Row>
    </Container>
    )   
}

export default UnitAssignment