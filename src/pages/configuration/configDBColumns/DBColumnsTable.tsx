import React, { useState, useEffect } from 'react'
import { StyledTable } from '../../../components/StyledTable'
import { Container, SearchContainer, SearchInput } from "../../../components/StyledComponents";
import {  SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { SystemProfileProps } from '../../../types/SystemProfile_drawer';
import { ColumnsType } from 'antd/es/table';
import { Tag, Space, Button } from 'antd';
import { getSystems } from '../../../hooks/configuration/systemProfile_hooks';
import { Loader } from '../../../components/Loader';
import { useNavigate } from 'react-router-dom';

const DBColumnsTable = () => {
    const {systems : fetchAllSystems, loading : sysLoading} = getSystems();
    const [ filteredSystems, setFilterSystems ] = useState<SystemProfileProps[]>([]);
    const [ search, setSearch ] = useState("");
    const navigate = useNavigate();

    

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
            title: 'Action',
            key: 'action', 
            render: (_: any, record: SystemProfileProps) => (
                <Space size="middle">
                    <Button type="link" size="small" onClick={() => navigate(`/configDBColumnsDetails/${btoa(record.SystemAlias)}/${btoa(record.SystemName)}`) }><EyeOutlined></EyeOutlined></Button>
                </Space>
            )
            
        }
       
    ]

    useEffect(() =>{
        if(fetchAllSystems){
            setFilterSystems(fetchAllSystems)
        }
    }, [fetchAllSystems]);

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

    if (sysLoading) return <Loader></Loader>


  return (
    <Container>
        <SearchContainer>
            <SearchInput placeholder='Search by System Alias, Name, or Status' value={search} onChange={handleSearch} suffix={<SearchOutlined/>}></SearchInput>
        </SearchContainer>
        <StyledTable<SystemProfileProps> columns={columns} data={filteredSystems} rowKey='SystemId'></StyledTable>
    </Container>
  )
}

export default DBColumnsTable