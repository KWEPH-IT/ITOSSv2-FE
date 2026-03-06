import { useState, useEffect } from 'react'
import { Container, StyledInput, StyledSelect, AddButton } from "../../../components/StyledComponents";
import { Form, Row, Col, Button, Tag, Space, message, Modal, Upload, Card, Typography, Popconfirm } from 'antd';
import { StyledTable } from '../../../components/StyledTable';
import { ColumnsType } from 'antd/es/table';
import { AssetRequisitionProps } from '../../../types/AssetRequisition_drawer';
import { getAssetRequisition } from '../../../hooks/inventory/assetRequisition_hooks';
import { Loader } from '../../../components/Loader';
import { EditTwoTone, DownloadOutlined, InboxOutlined, CheckSquareOutlined, ScanOutlined, LeftOutlined, SendOutlined } from "@ant-design/icons";
import API from '../../../api/api';
import type { UploadProps } from 'antd';


const { Dragger } = Upload;
const { Text, Title } = Typography;

const AssetRequisitionTable = () => {
    const [ searchForm ] = Form.useForm()
    const [ openModal, setOpenModal ] = useState(false);
    const [ editingId, setEditingId ] = useState<number | null>(null);
    const { assets : fetchAllAssets, loading : assLoading, refetch } = getAssetRequisition();
    const [ filtered, setFilteredItems ] = useState<AssetRequisitionProps[]>([]);
    const [ checking, setChecking ] = useState(false);
    const [ scanResult, setScanResult ] = useState<{
        serial: string;
        exists: boolean;
      } | null>(null);
    const [ updatedData, setUpdatedData ] = useState<Partial<AssetRequisitionProps>>({});
    const [ updatingId, setUpdatingId] = useState<number | null>(null);
    const [ form ] = Form.useForm();


    const cancelEdit = () => {
        setUpdatedData({});
        setUpdatingId(null);
    }

    const handleEdit = (record: AssetRequisitionProps) => {
        setUpdatingId(record.SystemId);
        setUpdatedData({...record});
        form.setFieldsValue({
            ItemDescription : record.ItemDescription,
            AccountName : record.AccountName,
            Brand : record.Brand,
            Model : record.Model,
            EType : record.EType,
        })
    }

    const saveEdit = async(id : number) => {
        try {
            const values = await form.validateFields();

            setEditingId(id);
            const response = await API.put(`/api/updAsset/${id}`, values);
            if (response.status === 200) {
              message.success("Asset details updated successfully!");
              refetch();
            }
          } catch (err: any) {
            message.error("Something went wrong: " + err.message);
          } finally {
            setEditingId(null);
            cancelEdit();
        }
    }




    const columns: ColumnsType<AssetRequisitionProps> = [
        { title: 'Serial Number', dataIndex: 'SerialNumber', key: 'SerialNumber' },
        { title: 'Asset Tag', dataIndex: 'AssetTag', key: 'AssetTag' },
        {
            title: 'Item Description',
            dataIndex: 'ItemDescription',
            key: 'ItemDescription',
            render: (text, record: AssetRequisitionProps) =>
                updatingId === record.SystemId ? (
                    <Form.Item name='ItemDescription' 
                    rules={[{ required : true}]}>
                        <StyledInput></StyledInput>
                    </Form.Item>
                ) : (
                    text
                ),
        },
        { 
            title: 'Account Name', 
            dataIndex: 'AccountName', 
            key: 'AccountName',
            render: (text, record: AssetRequisitionProps) =>
                updatingId === record.SystemId ? (
                    <Form.Item name='AccountName' 
                    rules={[{ required : true}]}>
                        <StyledInput></StyledInput>
                    </Form.Item>
                ) : (
                    text
                ),
        },
        {
            title: 'Brand',
            dataIndex: 'Brand',
            key: 'Brand',
            render: (text, record: AssetRequisitionProps) =>
                updatingId === record.SystemId ? (
                    <Form.Item name='Brand' 
                    rules={[{ required : true}]}>
                        <StyledInput></StyledInput>
                    </Form.Item>
                ) : (
                    text
                ),
        },
        {
            title: 'Model',
            dataIndex: 'Model',
            key: 'Model',
            render: (text, record: AssetRequisitionProps) =>
                updatingId === record.SystemId ? (
                    <Form.Item name='Model' 
                    rules={[{ required : true}]}>
                        <StyledInput></StyledInput>
                    </Form.Item>
                ) : (
                    text
                ),
        },
        {
            title: 'Type',
            dataIndex: 'EType',
            key: 'EType',
            render: (text, record: AssetRequisitionProps) =>
                updatingId === record.SystemId ? (
                    <Form.Item name='EType' 
                    rules={[{ required : true}]}>
                        <StyledInput></StyledInput>
                    </Form.Item>
                ) : (
                    text
                ),
        },
        { title: 'Cost', dataIndex: 'Cost', key: 'Cost' },
        {
            title: 'Status',
            dataIndex: 'Status',
            key:'Status',
            render: (_:any, record : AssetRequisitionProps) => {
                return (
                    <Tag color={record.Existing === 1 ? 'green' : 'red'}> { record.Existing === 1 ? 'Exisitng' : 'Not Found' } </Tag>
                )
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_:any, record: AssetRequisitionProps) => updatingId === record.SystemId ? (
                <Space>
                    <Button type="primary" size="small" htmlType="submit" loading={editingId === record.SystemId} onClick={() => saveEdit(record.SystemId)} >Save</Button>
                    <Button danger size="small" onClick={cancelEdit}>Cancel</Button>
                </Space>
            ) : (
                <Button type='link' size='small' onClick={() =>handleEdit(record)}><EditTwoTone></EditTwoTone></Button>
            ),
        },
    ];

    

    const handleSearching = (values : any) => {
        const data = fetchAllAssets.filter((item : AssetRequisitionProps) => {
            return (
                (!values.SerialNumber || item.SerialNumber?.toLowerCase().includes(values.SerialNumber.toLowerCase())) &&
                (!values.EType || item.EType?.toLowerCase().includes(values.EType.toLowerCase())) &&
                (values.Existing === undefined || item.Existing === values.Existing)
            );
        });
        setFilteredItems(data);
    }

    const clearfields = () => {
        searchForm.resetFields();
        setFilteredItems(fetchAllAssets);
    }

    useEffect(() =>{
        if(fetchAllAssets){
            setFilteredItems(fetchAllAssets)
        }
    }, [fetchAllAssets]);

    const uploadProps: UploadProps = {
        name: "file",
        multiple: false, // Excel usually 1 file only
        customRequest: async ({ file, onSuccess, onError }) => {
          try {
            const formData = new FormData();
            formData.append("file", file as Blob);
      
            const response = await API.post('/api/upload-assetReq-excel', formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );
      
            // message.success("File uploaded successfully");
            // onSuccess && onSuccess(response.data);

            const {
                inserted,
                duplicates_skipped,
                duplicate_serials,
              } = response.data;
      
              // ✅ Success message
              message.success(
                `Upload completed: ${inserted} record(s) inserted.`
              );
      
              // ⚠️ Warning message for duplicates
              if (duplicates_skipped > 0) {
                message.warning(
                  `${duplicates_skipped} duplicate serial number(s) were skipped: ${duplicate_serials.join(", ")}`
                );
              }



          } catch (err: any) {
            console.error(err);
            message.error("File upload failed.");
            onError && onError(err);
          }
        },
      
        onChange(info) {
          console.log("File List:", info.fileList);
        },
      
        onDrop(e) {
          console.log("Dropped files", e.dataTransfer.files);
        },
    };


    const downloadTemplate = () => {
        const link = document.createElement("a");
        link.href = "/templates/AssetRequisition.xlsx";
        link.download = "AssetRequisition.xlsx";
        link.click();
    };

    const handleScan = async (serial: string) => {
        if (!serial) return;
      
        try {
          const res = await API.post("/api/check-serial", {
            serial_number: serial,
          });
      
          setScanResult({
            serial,
            exists: res.data.exists,
          });
      
        } finally {
          // clear input for next scan
          setTimeout(() => {
            document.querySelector<HTMLInputElement>("input")?.select();
          }, 100);
        }
      };

    const handleGoback = () => {
        setChecking(false)
        refetch();
    }

    const reqAssetTag = async () => {
        try {
            const response = await API.post(`/api/reqAssetTag`);
            
            if (response.status === 200){
                message.success("Asset tag request sent!");
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || "Request failed");
        }
    };
    

    if (assLoading) return <Loader></Loader>

    if (checking) return (
        <Container>
           
           <Button type="primary" style={{ width:"170px" }} onClick={() => handleGoback()}> <LeftOutlined/> GO BACK  </Button>

            <Card
            style={{
                marginBottom: 24,
                borderRadius: 12,
                marginTop: 24
            }}
            >

            <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Title level={5} style={{ margin: 0 }}>
                    <ScanOutlined /> Scan Serial Number
                    </Title>

                    <Popconfirm
                    title="Are you sure you want to request Asset Tag?"
                    onConfirm={() => reqAssetTag()}
                    okText="Yes"
                    cancelText="No"
                    >
                    <Button color="cyan" variant="solid" style={{ width: "190px" }}>
                        <SendOutlined /> REQUEST ASSET TAG
                    </Button>
                    </Popconfirm>
                </div>

                <StyledInput
                    size="large"
                    placeholder="Scan barcode here..."
                    autoFocus
                    onPressEnter={(e) => handleScan(e.currentTarget.value)}
                />

                

                <Text type="secondary">
                Scanner ready. Scan a barcode to update item status.
                </Text>
            </Space>
            </Card>

            {scanResult && (
                <Card
                    size="small"
                    style={{
                    marginBottom: 16,
                    borderRadius: 8,
                    background: scanResult.exists ? "#f6ffed" : "#fff1f0",
                    borderColor: scanResult.exists ? "#b7eb8f" : "#ffa39e",
                    }}
                >
                    <Space>
                    <Tag color={scanResult.exists ? "green" : "red"}>
                        {scanResult.exists ? "EXISTING" : "NOT FOUND"}
                    </Tag>

                    <Text>
                        Serial Number: <b>{scanResult.serial}</b>
                    </Text>
                    </Space>
                </Card>
            )}

        </Container>
    )
  return (
    <Container>

        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '30px', alignItems: 'center' }}>
            <Form layout="vertical" form={searchForm} onFinish={handleSearching}>
                <Row justify="center" gutter={[16, 16]} align="bottom">
                    <Col xs={24} sm={12} md={4}>
                        <Form.Item label="Serial Number" name="SerialNumber">
                            <StyledInput placeholder="Search by Serial Number" allowClear />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Form.Item label="Unit Type" name="UnitType">
                            <StyledInput placeholder="Search by Unit Type" allowClear />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Form.Item label="Status" name="Existing">
                            <StyledSelect 
                            options={[ 
                                {value : 1, label: 'Existing'},
                                {value : 0, label: 'For checking'}
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
            <Space>
                <AddButton type="primary" style={{ width:"170px" }} onClick={() => setOpenModal(true)}> <DownloadOutlined/> UPLOAD  </AddButton>
                
                <AddButton type="default" style={{ width:"170px" }} onClick={() => setChecking(true)}> <CheckSquareOutlined/> ITEMS CHECKING  </AddButton>
            </Space>
        </div>
        <Form  form={form} >
            <StyledTable<AssetRequisitionProps> columns={columns} data={filtered}  rowKey='SystemId'></StyledTable>
        </Form>

        <Modal open={openModal} title="Upload List" onCancel={ () => setOpenModal(false) } footer={null}>
            <div style={{ marginTop: '20px', lineHeight: '0.7px' }}>
                <Button type="primary" onClick={downloadTemplate}><DownloadOutlined/> Download Format</Button>
                <p style={{ fontSize: '11px', color: 'red' }}> NOTE: KINDLY MAKE SURE TO FOLLOW THE FORMAT BEFORE UPLOADING </p>
                
                <Dragger {...uploadProps} style={{ marginTop: '20px' }}>
                    <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                    </p>
                    <p style={{ fontSize: '11px' }} className="ant-upload-text">Click or drag file to this area to upload</p>
                </Dragger>            

            </div>

        </Modal>
        

    </Container>
  )
}

export default AssetRequisitionTable