import React, { useState, useEffect } from 'react';
import { StyledTable } from '../../../components/StyledTable';
import { Container, SearchContainer, SearchInput, AddButton } from "../../../components/StyledComponents";
import {  SearchOutlined, AppstoreAddOutlined, EditOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Loader } from "../../../components/Loader";
import { Button, Space, Tag } from 'antd';
import type { ColumnsType } from "antd/es/table";
import { GroupEmailProps } from '../../../types/GroupEmails_drawer'; 
import { useGroupEmails } from '../../../hooks/configuration/groupEmail_hooks'; 
import { useNavigate } from 'react-router-dom';


const GroupEmailTable = ({ onAddUserClick, onEditClick, shouldRefresh} : { onAddUserClick: () => void, onEditClick: (record: GroupEmailProps) => void, shouldRefresh: number}) => {

    const { group, loading, refetch } = useGroupEmails();
    const [ search, setSearch ] = useState("");
    const [ filtered, setFiltered ] = useState<GroupEmailProps[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if(group){
            setFiltered(group)
        }
    }, [group]);

    useEffect(() => {
        if(shouldRefresh){
            refetch();
        }
    },[shouldRefresh])

    const columns: ColumnsType<GroupEmailProps> = [
        { title: "Group Name", key: "GroupName", dataIndex: "GroupName" },
        { title: "Group Email", key: "GroupEmail", dataIndex: "GroupEmail" },
        { title: "Date Added", key: "DateAdded", dataIndex: "DateAdded" },
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
            render: (_: any, record: GroupEmailProps) => (
                <Space size="middle">
                    <Button type="link" size="small" onClick={() => onEditClick(record)}><EditOutlined></EditOutlined></Button>
                    <Button type="link" size="small" onClick={() => navigate(`/configGroupMember/${btoa(record.GroupEmail)}`) }><UsergroupAddOutlined></UsergroupAddOutlined></Button>
                </Space>
            )

        }
    ]

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.toLowerCase();
        setSearch(value);

        const filtered = group.filter((grp: GroupEmailProps) => {
            return ( 
                ( grp.GroupName? grp.GroupName.toLowerCase() : '' ).includes(value) ||
                ( grp.GroupEmail? grp.GroupEmail.toLowerCase() : '').includes(value)
            )
        }); 
        setFiltered(filtered);
    }



    if (loading) return <Loader></Loader>
    return (
        <Container>
            <SearchContainer>

                <SearchInput placeholder="Search by Group Name or Email" value={search} onChange={handleSearch} suffix={<SearchOutlined />}></SearchInput>
                <AddButton type="primary" onClick={onAddUserClick} > <AppstoreAddOutlined/> ADD GROUP EMAIL  </AddButton>
            </SearchContainer>
            <StyledTable<GroupEmailProps> columns={columns} data={filtered} rowKey='SystemId' />



        </Container>
    )
}

export default GroupEmailTable