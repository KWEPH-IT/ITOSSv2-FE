import React, { useState, useEffect } from 'react';
import { getSystems } from '../../../hooks/configuration/systemProfile_hooks';
import { StyledTable } from '../../../components/StyledTable';
import { Container, SearchContainer, SearchInput, AddButton } from "../../../components/StyledComponents";
import {  SearchOutlined, AppstoreAddOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import { Loader } from "../../../components/Loader";
import { Button, Space, Modal, Descriptions, Tag, Row, Input } from 'antd';
import type { ColumnsType } from "antd/es/table";
import { confirmPass } from '../../../services/authLogin';
import { SystemProfileProps } from '../../../types/SystemProfile_drawer';


const SystemProfileTable = ({ onAddUserClick, onEditClick, shouldRefresh }: { onAddUserClick: () => void, onEditClick: (record: SystemProfileProps) => void, shouldRefresh: number }) => {
    const {systems : fetchAllSystems, loading : sysLoading, refetch} = getSystems();
    const [ filteredSystems, setFilterSystems ] = useState<SystemProfileProps[]>([]);
    const [ viewRecord, setViewRecord ] = useState<SystemProfileProps | null>(null);
    const [ openModal, setOpenModal ] = useState<boolean>(false); 
    const [ isShowValidator, setShowValidator ] = useState<boolean>(false);
    const [ enteredPassword, setEnteredPassword ] = useState<string>("");
    const [ isShowCred, setShowCred ] = useState<boolean>(false);
    const [ search, setSearch ] = useState("");
    const [ isloading, setLoading ] = useState(true);


    const columns: ColumnsType<SystemProfileProps> = [
        {
            title: 'System Name',
            dataIndex: 'SystemName',
            key: 'SystemName',
        },
        {
            title: 'Alias',
            dataIndex: 'SystemAlias',
            key: 'SystemAlias',
        },
        {
            title: 'DB Type',
            dataIndex: 'DBType',
            key: 'DBType',
        },
        {
            title: 'Remarks',
            dataIndex: 'Remarks',
            key: 'Remarks',
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            render: (status : string) => (
                <Tag color={Number(status) === 1 ? 'green' : 'red' }>
                    {Number(status) === 1 ? 'Active' : 'Inactive'} 
                </Tag>
            )
        }, 
        {
            title: 'Actions',
            key: 'actions', 
            render: (_: any, record: SystemProfileProps) => (
                <Space size="middle">
                    <Button type="link" size="small" onClick={() => handleView(record)}><EyeOutlined></EyeOutlined></Button>
                    <Button type="link" size="small" onClick={() => onEditClick(record)}><EditOutlined></EditOutlined></Button>
                </Space>
            )
        }
    ]

    useEffect(() =>{
        if(fetchAllSystems){
            setFilterSystems(fetchAllSystems)
        }
    }, [fetchAllSystems]);

    // ✅ REFRESH when shouldRefresh changes
    useEffect(() => {
        if (shouldRefresh) {
          refetch();
        }
      }, [shouldRefresh]); // 👈 watch shouldRefresh only

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) =>{
        const value = event.target.value.toLowerCase();
        setSearch(value);

        const filtered = fetchAllSystems.filter((sys: SystemProfileProps) => {
            const StatusText  = sys.Status === 1 ? 'active' : 'inactive';
            
            return (
                (sys.SystemName ? sys.SystemName.toLowerCase() : '').includes(value) ||
                (sys.SystemAlias ? sys.SystemAlias.toLowerCase() : '').includes(value) ||
                (sys.DBType ? sys.DBType.toLowerCase() : '').includes(value) ||
                (sys.Status ? sys.Status.toString().toLowerCase() : '').includes(value) ||
                StatusText.includes(value)
            );
        });
        setFilterSystems(filtered);
    };

    const handleView = (record : SystemProfileProps) => {
        setOpenModal(true);
        setLoading(true);

        setTimeout(() =>{
            setLoading(false);
            setViewRecord(record);
        }, 1000 );
    }

    const verifyPassword = async() => {
        const isValid = await confirmPass(enteredPassword);

        if (isValid){
            setShowCred(true);
            setShowValidator(false);
            setEnteredPassword("");
        }

    }

      if(sysLoading) return <Loader></Loader>
  return (
    <Container>
        <SearchContainer >
            <SearchInput placeholder="Search by System Name, Alias, DB Type or Status" value={search} onChange={handleSearch}  suffix={<SearchOutlined />}></SearchInput>
            <AddButton type="primary" onClick={onAddUserClick}> <AppstoreAddOutlined/> ADD SYSTEM PROFILE  </AddButton>
        </SearchContainer>
        <StyledTable<SystemProfileProps> columns={columns} data={filteredSystems} rowKey='SystemId'></StyledTable>
        <Modal title={<p className="modal-config-title">System Details</p>} loading={isloading} open={openModal} onCancel={ () => setOpenModal(false)} footer={null}>

            <div style={{ lineHeight: 1.4 }}>
                <p style={{ fontSize: "15px", letterSpacing: "0.7px", margin: 0 }}>
                    {viewRecord?.SystemName} <span>({viewRecord?.SystemAlias})</span>
                </p>
                <Tag color='blue' style={{ fontSize: "10px", padding: "0 6px", marginTop: "2px" }}>
                    IN-HOUSE
                </Tag>
                <Tag color='green' style={{ fontSize: "10px", padding: "0 6px", marginTop: "2px" }}>
                    {viewRecord?.DBType}
                </Tag>
            </div>

            <div style={{ marginTop: 25}} >
                <Row gutter={12}>
                    <p style={{ fontSize: "10px", padding: "0 6px", marginTop: "2px", fontWeight: 600}}> DATABASE CREDENTIALS </p>
                </Row>

                {
            
                <Descriptions column={1} bordered size="small" className="small-desc">
                    
                    {   isShowCred ? (
            
                            <>
                            <Descriptions.Item label="DB Username">  {viewRecord?.DBUsername} </Descriptions.Item>
                            <Descriptions.Item label="DB Password"> {viewRecord?.DBPassword} <Button type="link" style={{ fontSize: 12}} size="small" onClick={() => { setShowValidator(false); setShowCred(false);}}> Lock </Button> </Descriptions.Item>
                            </>
                        ) :
                        isShowValidator ? (
                        <Space>
                            <Input.Password size="small" placeholder="Enter password" value={enteredPassword} onChange={(e) => setEnteredPassword(e.target.value)} />
                            <Button type='primary' style={{ fontSize: 12, marginTop: 2, marginRight: 5}} size="small" onClick={() => verifyPassword()}>OK</Button>
                            <Button style={{ fontSize: 12, marginTop: 2}} size="small" onClick={() => setShowValidator(false)} >Cancel</Button>
                        </Space>
                        ) : (
                        <>
                            <Descriptions.Item label="DB Username">  •••••••• </Descriptions.Item>
                            <Descriptions.Item label="DB Password"> •••••••• <Button type="link" size="small" style={{ fontSize: 12}} onClick={() => setShowValidator(true)}> Unlock </Button> </Descriptions.Item>
                        </>
                    )}
                </Descriptions>
                }
            </div>

            <div style={{ marginTop: 25}} >
                <Row gutter={12}>
                    <p style={{ fontSize: "10px", padding: "0 6px", marginTop: "2px", fontWeight: 600}}> DEVELOPER SETTINGS </p>
                </Row>
                {
                <Descriptions column={1} bordered size="small" className="small-desc">
                    <Descriptions.Item label="DB Table Identifier"> {viewRecord?.DBTableIdentifier } </Descriptions.Item>
                    <Descriptions.Item label="DB Password Column Name"> {viewRecord?.DBPasswordColName} </Descriptions.Item>
                    <Descriptions.Item label="DB Password Status Name"> {viewRecord?.DBStatusColName} </Descriptions.Item>
                    <Descriptions.Item label="Fields not to include in importing"> {viewRecord?.FieldsToRemove} </Descriptions.Item>
                </Descriptions>
                
                }
            </div>

            <div style={{ marginTop: 25}} >
                <Row gutter={12}>
                    <p style={{ fontSize: "10px", padding: "0 6px", marginTop: "2px", fontWeight: 600}}> SERVERS </p>
                </Row>
                {
                <Descriptions column={1} bordered size="small" className="small-desc">
                    <Descriptions.Item label="Source code Server"> {viewRecord?.SourceCodeServer } </Descriptions.Item>
                    <Descriptions.Item label="Database Server"> {viewRecord?.DBServerName} </Descriptions.Item>
                </Descriptions>
                }
            </div>

            <div style={{ marginTop: 25}} >
                <Row gutter={12}>
                    <p style={{ fontSize: "10px", padding: "0 6px", marginTop: "2px", fontWeight: 600}}> GENERAL INFORMATION </p>
                </Row>
                {
                <Descriptions column={1} bordered size="small" className="small-desc">
                    <Descriptions.Item label="Created By"> {viewRecord?.CreatedBy } </Descriptions.Item>
                    <Descriptions.Item label="Date Created"> {viewRecord?.DateCreated} </Descriptions.Item>
                    <Descriptions.Item label="Modified By"> {viewRecord?.ModifiedBy } </Descriptions.Item>
                    <Descriptions.Item label="Date Modified"> {viewRecord?.DateModified} </Descriptions.Item>
                </Descriptions>
                }
            </div>
        </Modal>
    </Container>
  )
}

export default SystemProfileTable