import { useState, useEffect, useMemo } from 'react'
import { StyledTable } from '../../../components/StyledTable'
import { Container, StyledInput, StyledSelect, NormalButton } from '../../../components/StyledComponents'
import { Form, Row, Col, Space, Button, Drawer , Tag, Modal, DatePicker, Card} from 'antd'
import { PlusOutlined, DownloadOutlined, SearchOutlined, ReloadOutlined, DownOutlined, EditOutlined } from "@ant-design/icons";
import { ColumnsType } from 'antd/es/table';
import { EquipmentInvProps } from '../../../types/EquipmentInv_drawer';
import { getAllEquipment } from '../../../hooks/inventory/equipmentInv_hooks';
import { Loader } from '../../../components/Loader';
import dayjs from "dayjs";
import { formatDate } from '../../../utils/dateFormatter';

// 2️⃣ Type helper for string keys
type StringKeys<T> = {
    [K in keyof T]: T[K] extends string ? K : never
  }[keyof T]


  // TS-safe function
function getDistinctOptions<T>(
    data: T[],
    key: StringKeys<T>
  ): { label: string; value: string }[] {
    const uniqueValues = Array.from(
      new Set(
        data
          .map(item => item[key])           // T[StringKeys<T>]
          .filter(Boolean) as string[]      // ✅ cast to string[]
      )
    )
    // Sort alphabetically
    uniqueValues.sort((a, b) => a.localeCompare(b))
    return uniqueValues.map(value => ({ label: value, value }))
}

const EquipmentInvTable = ({onAddNew, shouldRefresh} : {onAddNew: () => void, shouldRefresh: number}) => {
    const [ openAdvFilter, setOpenAdvFilter ] = useState(false);
    const { equipment: fetchAllEquipment, loading, refetch } = getAllEquipment()
    const [ quickform ] = Form.useForm()
    const [ advform ] = Form.useForm();
    const [ filteredData, setFilteredData ] = useState<EquipmentInvProps[]>([]);
    const [ modalOpen, setModalOpen ] = useState(false);
    const [ editform ] = Form.useForm()
    const [ isSubmit, setIsSubmit ] = useState(false);
    const [ editingRecord, setEditingRecord ] = useState<EquipmentInvProps | null>(null);

    const columns: ColumnsType<EquipmentInvProps> = [
        { 
            title: "Equipment", 
            render: record => (
                <>
                    <strong>{record.EqType}</strong>
                    <div className="muted">{record.Brand} • {record.Model}</div>
                </>
            )
        },
        { 
            title: "Serial # • Asset Tag", 
            render: record => (
                <>
                    {record.SerialNumber} • {record.AssetTag}
                </>
            )
        },
        { 
            title: "Year Acquired", 
            render: record => (
                <>
                    {record.Year_Acquired}
                </>
            )
        },
        { 
            title: "Year Issued", 
            render: record => (
                <>
                    {record.Year_Issued}
                </>
            )
        },

        { 
            title: "Remarks", 
            render: record => (
                <>
                    {record.Remarks}
                </>
            )
        },

        { 
            title: "Others", 
            render: record => (
                <>
                    {record.Others}
                </>
            )
        },

        { 
            title: "Assigned To", 
            render: record => (
                <>
                    <strong>{record.EmployeeName}</strong>
                    <div className="muted">{record.Area} • {record.Section}  • {record.Department} • {record.Designation}</div>
                </>
            )
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
        {
            title: "Action",
            render: (_: any, record: any) => (
                <>
                  <Button
                    type="link"
                    onClick={() => handleEdit(record)}
                  >
                    <EditOutlined />
                  </Button>
                </>
            )
        }
    ]

    const eqTypeOptions = useMemo(() => {
        if (!fetchAllEquipment) return [];
        return getDistinctOptions(fetchAllEquipment, 'EqType');
      }, [fetchAllEquipment]);

    const brandOptions = useMemo(() => {
        if (!fetchAllEquipment) return [];
        return getDistinctOptions(fetchAllEquipment, 'Brand');
      }, [fetchAllEquipment]);

    const modelOptions = useMemo(() => {
        if (!fetchAllEquipment) return [];
        return getDistinctOptions(fetchAllEquipment, 'Model');
      }, [fetchAllEquipment]);


    const deptOptions = useMemo(() => {
        if (!fetchAllEquipment) return [];
        return getDistinctOptions(fetchAllEquipment, 'Department');
      }, [fetchAllEquipment]);

    const areaOptions = useMemo(() => {
        if (!fetchAllEquipment) return [];
        return getDistinctOptions(fetchAllEquipment, 'Area');
      }, [fetchAllEquipment]);
    
    const sectOptions = useMemo(() => {
        if (!fetchAllEquipment) return [];
        return getDistinctOptions(fetchAllEquipment, 'Section');
      }, [fetchAllEquipment]);
    
    const handleReset = () => {
        advform.resetFields()
        quickform.resetFields()
        refetch();
    }

    const handleSearch = () => {
        const quickSearch = quickform.getFieldsValue();
        const advSearch = advform.getFieldsValue();

        applyFilters({
            ...quickSearch,
            ...advSearch
        })

        setOpenAdvFilter(false)
    }

    // ✅ REFRESH when shouldRefresh changes
    useEffect(() => {
        if (shouldRefresh) {
          refetch();
        }
      }, [shouldRefresh]); // 👈 watch shouldRefresh only

    const applyFilters = (values : any) => {
        const data = fetchAllEquipment.filter((item : EquipmentInvProps) => {
            return (
                (!values.EmployeeName ||
                    item.EmployeeName?.toLowerCase().includes(values.EmployeeName.toLowerCase())) &&
            
                  (!values.Department ||
                    item.Department?.toLowerCase() === values.Department.toLowerCase()) &&
            
                  (!values.AssetTag ||
                    item.AssetTag?.toLowerCase().includes(values.AssetTag.toLowerCase())) &&
            
                  (!values.SerialNumber ||
                    item.SerialNumber?.toLowerCase().includes(values.SerialNumber.toLowerCase())) &&
            
                  (!values.Area || item.Area === values.Area) &&
                  (!values.Section || item.Section === values.Section) &&
                  (!values.EqType || item.EqType === values.EqType) &&
                  (!values.Brand ||
                    item.Brand?.toLowerCase().includes(values.Brand.toLowerCase())) &&
            
                  (!values.Model ||
                    item.Model?.toLowerCase().includes(values.Model.toLowerCase())) &&
            
                  (!values.Remarks ||
                    item.Remarks?.toLowerCase().includes(values.Remarks.toLowerCase())) &&
            
                  (!values.Others ||
                    item.Others?.toLowerCase().includes(values.Others.toLowerCase())) &&

                  (!values.Status ||
                    item.Status?.toLowerCase().includes(values.Status.toLowerCase()))
            );
        });
        setFilteredData(data);
    }

    const handleEdit = async(record: EquipmentInvProps) => {
        setEditingRecord(record)
        setModalOpen(true);
        editform.setFieldsValue ({
            EqType: record.EqType,
            Model: record.Model,
            Brand: record.Brand,
            AssetTag: record.AssetTag,
            OS: record.OS,
            Processor: record.Processor,
            Storage: record.Storage,
            Memory: record.Memory,
            Year_Acquired: record.Year_Acquired ? dayjs(record.Year_Acquired) : null,
            Year_Issued: record.Year_Issued ? dayjs(record.Year_Issued) : null,
            EndofWarranty: record.EndofWarranty ? dayjs(record.EndofWarranty) : null,
            ForReplacementYear: record.ForReplacementYear ? dayjs(record.ForReplacementYear) : null,
            Others: record.Others,
            Remarks: record.Remarks
        })
    }

    const handleSubmitUpdate = async(values: any) => {
        setIsSubmit(true);
        

        const payload = {
            ...values,
            serial: editingRecord?.SerialNumber,

        
            Year_Acquired: values.Year_Acquired? formatDate(values.Year_Acquired) : null,
            Year_Issued: values.Year_Issued ? formatDate(values.Year_Issued): null,
            EndofWarranty: values.EndofWarranty ?  formatDate(values.EndofWarranty) : null,
            ForReplacementYear: values.ForReplacementYear ? formatDate(values.ForReplacementYear) : null
        };
        
          // API call here
          console.log(payload);
        
          setModalOpen(false);
          
        
        // const response = await API.put(`/api/UpdateSystemPro`, payloadWithId);
        
        // if (response.status === 200){
        //     message.success("Profile successfully updated!");
        //     form.resetFields();
        //     closeDrawer();
        //     onUserAction();
        // }
        // else{
        //     message.error(response.data.mesage);
        // }
    }

    useEffect(() =>{
        if(fetchAllEquipment){
            setFilteredData(fetchAllEquipment);
        }
    }, [fetchAllEquipment]);

   
    if (loading) return <Loader></Loader>
  return (
    <Container>
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '30px', alignItems: 'center' }}>
            <Row gutter={[48,48]} justify="end" align="middle" style={{marginBottom: "30px"}}>
                <Space>
                    <NormalButton icon={<PlusOutlined />} style={{width:"150px", height: "45px", backgroundColor: "#000", color: "#FFF", fontWeight: 600}} onClick={onAddNew}>Add New </NormalButton>
                </Space>
            </Row>

            <Form layout='vertical' form={quickform}>
                <Row gutter={[16, 16]} >
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item label="Employee Name" name="EmployeeName">
                            <StyledInput></StyledInput>
                        </Form.Item>
                    </Col>

                
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item label="Asset Tag" name="AssetTag">
                            <StyledInput></StyledInput>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Form.Item label="Serial Number" name="SerialNumber">
                            <StyledInput></StyledInput>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[15, 16]} justify="space-between" align="middle" style={{marginBottom: "30px"}}>
                    <Button type="link" onClick={() => setOpenAdvFilter(true)}><DownOutlined /> Advanced Filters</Button>
                    <Space>
                        <Button type="primary" icon={<SearchOutlined />} style={{width:"150px"}} onClick={handleSearch}>Search</Button>
                        <Button icon={<ReloadOutlined />} style={{width:"150px"}} onClick={handleReset}>Reset</Button>
                        <NormalButton icon={<DownloadOutlined />} style={{width:"150px"}}>Export</NormalButton>
                        
                    </Space>
                </Row>
            </Form>

            <Drawer
                title="Advanced Filters"
                placement='right'
                width={400}
                open={openAdvFilter}
                onClose={ () => setOpenAdvFilter(false)}
                footer={
                    <Space style={{ float: "right" }}>
                      <Button onClick={handleReset}>
                        Reset
                      </Button>
                      <Button
                        type="primary"
                        onClick={handleSearch}
                      >
                        Apply Filters
                      </Button>
                    </Space>
                  }
            >
                <Form
                    layout="vertical"
                    form={advform}
                    onFinish={handleSearch}
                >
                    <Form.Item name="Area" label="Area">
                        <StyledSelect
                                allowClear
                                options={areaOptions}
                                placeholder="Select equipment type"
                        />
                    </Form.Item>

                    <Form.Item name="Section" label="Section">
                        <StyledSelect
                            allowClear
                            options={sectOptions}
                            placeholder="Select equipment type"
                        />
                    </Form.Item>

                    <Form.Item label="Department" name="Department">
                        <StyledSelect
                            allowClear
                            options={deptOptions}
                            placeholder="Select equipment type"
                        />
                    </Form.Item>

                    <Form.Item name="EqType" label="Type">
                        <StyledSelect
                                allowClear
                                options={eqTypeOptions}
                                placeholder="Select equipment type"
                            />
                    </Form.Item>

                    <Form.Item name="Brand" label="Brand">
                        <StyledInput />
                    </Form.Item>

                    <Form.Item name="Model" label="Model">
                        <StyledInput />
                    </Form.Item>

                    <Form.Item name="Remarks" label="Remarks">
                        <StyledInput />
                    </Form.Item>

                    <Form.Item name="Others" label="Others">
                        <StyledInput />
                    </Form.Item>

                    <Form.Item name="Status" label="Status">
                        <StyledSelect >
                            <StyledSelect.Option value="Assigned">Assigned</StyledSelect.Option>
                            <StyledSelect.Option value="Available">Available</StyledSelect.Option>
                            <StyledSelect.Option value="Disposed">Disposed</StyledSelect.Option>
                        </StyledSelect>
                    </Form.Item>
                </Form>
            </Drawer>
        </div>

        <StyledTable<EquipmentInvProps> columns={columns} data={filteredData} rowKey='SystemId'></StyledTable>
        <Modal
          title="Edit Details"
          open={modalOpen}
          width={800}
          onCancel={()=> setModalOpen(false)}
          footer={null}
          >
            <Form layout='vertical' form={editform} style={{ marginTop: 30 }} onFinish={handleSubmitUpdate}>
                
            <Card variant='borderless'>
                <p style={{ fontWeight: 600, letterSpacing: 0.7, fontSize: 15, color: "#1677ff" }}> Equipment Details </p>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Type" name="EqType" rules={[{ required: true }]}>
                      <StyledSelect
                              allowClear
                              options={eqTypeOptions}
                              placeholder="Select equipment type"
                          />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Brand" name="Brand" rules={[{ required: true }]}>
                      <StyledSelect
                              allowClear
                              options={brandOptions}
                              placeholder="Select equipment type"
                          />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Model" name="Model" rules={[{ required: true }]}>
                      <StyledSelect
                              allowClear
                              options={modelOptions}
                              placeholder="Select equipment type"
                          />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Asset Code" name="AssetTag" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>                  
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Storage" name="Storage" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Memory" name="Memory" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Processor" name="Processor" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="OS" name="OS" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card variant='borderless' >
                <p style={{ fontWeight: 600, letterSpacing: 0.7, fontSize: 15,color: "#1677ff" }}> Lifecycle Details </p>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Date Acquired" name="Year_Acquired" >
                      <DatePicker style={{ width: "100%" }}/>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Date Issued" name="Year_Issued" >
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="End of Warranty" name="EndOfWarranty" >
                      <DatePicker style={{ width: "100%" }}/>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Replacement Date" name="ForReplacementYear" >
                      <DatePicker style={{ width: "100%" }}/>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card variant='borderless' >
                <p style={{ fontWeight: 600, letterSpacing: 0.7, fontSize: 15,color: "#1677ff" }}> Addtional Details </p>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Others" name="Others" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Remarks" name="Remarks" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

                <Button  block htmlType='submit' loading={isSubmit} style={{ backgroundColor: "#000", color: "#FFF", height: "45px", letterSpacing: 0.7, fontWeight: 600 }}> SUBMIT </Button>
                
            </Form>

          </Modal>
        

    </Container>
  )
}

export default EquipmentInvTable