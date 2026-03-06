import { useEffect, useState } from 'react'
import MainLayout from '../../MainLayout'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom';
import { Container, StyledInput, StyledSelect, AddButton } from "../../../components/StyledComponents";
import { Form, Row, Col, Button, Tag, Space, message, Popconfirm } from 'antd';
import { StyledTable } from '../../../components/StyledTable';
import { ColumnsType } from 'antd/es/table';
import { DBColumnProps } from '../../../types/DBColumns_drawers';
import { getDBColumns } from '../../../hooks/configuration/dbColumns_hooks';
import { Loader } from '../../../components/Loader';
import { EditTwoTone, ReloadOutlined } from "@ant-design/icons";
import API from '../../../api/api';


const DBColumnsDetails = () => {
    const { sa, sn } = useParams();
    const decoded_sa = sa ? atob(sa) : "";
    const decoded_sn = sn ? atob(sn) : "";

    const {columns : DBColumns, loading : DBLoading, refetch} = getDBColumns(decoded_sa);
    const [ editingId, setEditingId ] = useState<number | null>(null);
    const [ editedData, setEditedData ] = useState<Partial<DBColumnProps>>({});
    const [ filteredCols, setFilteredCols ] = useState<DBColumnProps[]>([]);
    const [ UpdatingId, setUpdatingId ] = useState<number | null>(null);
    const [ form ] = Form.useForm()
    const [ searchForm ] = Form.useForm()
    const [ loading, setLoading ] = useState(false)

    const handleEdit = (record: DBColumnProps) =>{
        setEditingId(record.SystemId);
        setEditedData({...record});
        form.setFieldsValue({
            Description : record.Description,
            ColGroup : record.ColGroup, 
            Status : record.Status
        });
    }

    const saveEdit = async() => {
        try{
          const values = await form.validateFields();

          const Id = editingId
          setUpdatingId(Id);
          const response = await API.put(`/api/dbcolUpd/${Id}`, values);
          if(response.status == 200){ 
            message.success(response.data?.message || "Column details updated successfully!");
            refetch();
          }
          else{
            message.error("Failed to update column details!");
          }
        }
        catch(err){
          message.error("Something went wrong: " + err)
        }
        finally{
          setUpdatingId(null);
          cancelEdit()
        }
      }

    const cancelEdit = () => {
        setEditedData({});
        setEditingId(null);
    }

    const columns: ColumnsType<DBColumnProps> = [
        {
            title: 'Database Column',
            dataIndex: 'DBColumn',
            key: 'DBColumn',
        },
        {
            title: 'Description',
            dataIndex: 'Description',
            key: 'Description',
            render: (text, record: DBColumnProps) =>
                editingId === record.SystemId ? (
                    <Form.Item name='Description' 
                    rules={[{ required : true}]}>
                        <StyledInput></StyledInput>
                    </Form.Item>
                ) : (
                    text
                ),
        },
        {
            title: 'Group',
            dataIndex: 'ColGroup',
            key: 'ColGroup',
            render: (text, record : DBColumnProps) =>
                editingId === record.SystemId ? (
                    <Form.Item name='ColGroup'
                    rules={[{ required : true }]}>
                        <StyledInput></StyledInput>
                    </Form.Item>
                ) : (
                    text
                ),
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            key:'Status',
            render: (_:any, record : DBColumnProps) => {
                return editingId === record.SystemId ? (
                    <Form.Item name='Status'
                        rules={[{ required : true }]}>
                        
                        <StyledSelect
                            value={(editedData?.Status ?? record.Status).toString()}
                            // onChange={(value) => handleFieldChange('Status', Number(value))}
                            style={{ width: 120 }}
                            >
                            <StyledSelect.Option value={1}>Active</StyledSelect.Option>
                            <StyledSelect.Option value={0}>Inactive</StyledSelect.Option>
                        </StyledSelect>
                    </Form.Item>
                ) : (
                <Tag color={record.Status === 1 ? 'green' : 'red'}> { record.Status === 1 ? 'Active' : 'Inactive' } </Tag>
                )
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_:any, record: DBColumnProps) => editingId === record.SystemId ? (
                <Space>
                    <Button type="primary" size="small" htmlType="submit" loading={UpdatingId === record.SystemId} onClick={() => setEditingId(record.SystemId)} >Save</Button>
                    <Button danger size="small" onClick={cancelEdit}>Cancel</Button>
                </Space>
            ) : (
                <Button type='link' size='small' onClick={() =>handleEdit(record)}><EditTwoTone></EditTwoTone></Button>
            ),
        },
    ];

    const handleSearching = (values : any) => {
        const data = DBColumns.filter((item : DBColumnProps) => {
            return (
                (!values.DBColumn || item.DBColumn?.toLowerCase().includes(values.DBColumn.toLowerCase())) &&
                (!values.Description || item.Description?.toLowerCase().includes(values.Description.toLowerCase())) &&
                (!values.ColGroup || item.ColGroup?.toLowerCase().includes(values.ColGroup.toLowerCase())) &&
                (values.Status === undefined || item.Status === values.Status)
            );
        });
        setFilteredCols(data);
    }

    const clearfields = () => {
        searchForm.resetFields();
        setFilteredCols(DBColumns);
    }

    useEffect(() => {
        if (decoded_sa) {
          refetch(); // This is the actual function to reload data
        }
      }, [decoded_sa]);

    useEffect(() => {
    setFilteredCols(DBColumns);
    }, [DBColumns]);


    const handleRefetch = async(sa : string) => {
        try{
            setLoading(true);
            const response = await API.post(`/api/dbColRefetch/${sa}`);

            if (response.status === 200) {
                message.success(response.data?.message || "Columns refetched successfully!");
                await refetch();
              } else {
                message.error(response.data?.message || "Failed to refetch columns.");
              }
        }
        catch(error: any){
            console.error("Error refetching columns:", error);
            message.error("An unexpected error occurred while refetching.");
        }
        finally{
            setLoading(false)
        }
    }

      
    if (DBLoading || loading) return <Loader></Loader>

  return (
    <MainLayout title={
        <>
          Configuration &gt;{' '}
          <Link to="/configDBColumns" style={{ textDecoration: 'underline' }}>
            System
          </Link>{' '}
          &gt; Setup Database Columns
        </>
      }
    >
        <Container>

            <p style={{ textAlign: 'center', fontSize: '16px', letterSpacing: '0.7px', fontWeight: 600, color: '#000'}}> {decoded_sn} ({decoded_sa}) </p>

 
            <div style={{ maxWidth: '100%', margin: '0 auto', padding: '30px', alignItems: 'center' }}>
                <Form layout="vertical" form={searchForm} onFinish={handleSearching}>
                    <Row justify="center" gutter={[16, 16]} align="bottom">
                        <Col xs={24} sm={12} md={4}>
                            <Form.Item label="DBColumn" name="DBColumn">
                                <StyledInput placeholder="Search by DBColumn" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Form.Item label="Description" name="Description">
                                <StyledInput placeholder="Search by Description" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Form.Item label="ColGroup" name="ColGroup">
                                <StyledInput placeholder="Search by Group" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Form.Item label="Status" name="Status">
                                <StyledSelect 
                                options={[ 
                                    {value : 1, label: 'Active'},
                                    {value : 0, label: 'Inactive'}
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
                {/* onClick={() => setOpenModal(true)} */}
                <Popconfirm
                    title="Are you sure you want to refetch the columns?"
                    onConfirm={() => handleRefetch(decoded_sa)}
                    onCancel={() => {
                        message.info("Refetch cancelled");
                    }}
                    okText="Yes"
                    cancelText="No"
                >
                    <AddButton color="cyan" variant="outlined" > <ReloadOutlined/> REFETCH COLUMNS  </AddButton>
                </Popconfirm>

            </div>

            <Form form={form} onFinish={saveEdit} >
                <StyledTable<DBColumnProps> columns={columns} data={filteredCols} rowKey='SystemId'></StyledTable>
            </Form>
            

        </Container>
    </MainLayout>
  )
}

export default DBColumnsDetails