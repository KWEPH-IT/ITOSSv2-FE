import { useEffect } from 'react'
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { Container, SearchInput , NormalButton} from '../../../components/StyledComponents'
import { Row, Col, Segmented, Space } from 'antd'
import { StyledTable } from '../../../components/StyledTable';
import { ColumnsType } from 'antd/es/table';
import { TicketCategProps } from '../../../types/TicketsCateg_drawer';
import { useTicketCategs } from '../../../hooks/configuration/ticketCateg_hooks';
import { Loader } from '../../../components/Loader';

const TicketCategoriesTable = ({ onAddUserClick, onEditClick, shouldRefresh} : { onAddUserClick: () => void, onEditClick: (record: TicketCategProps) => void, shouldRefresh: number}) => {
    const { categ, loading, refetch } = useTicketCategs() 
    

    const columns : ColumnsType<TicketCategProps> = [
        {
            title: "Category Name", dataIndex: "Name", key: "Name"
        },
        {
            title: "Parent ID", dataIndex: "ParentId", key: "ParentId"
        },
        {
            title: "Level", dataIndex: "HierarchyLevel", key: "HierarchyLevel"
        }, 
        {
            title: "Approvers", dataIndex: "Approvers", key: "Approvers"
        },
        {
            title: "Status", dataIndex: "Status", key: "Status"
        }
    ]

    useEffect(() => {
        if(shouldRefresh){
            refetch();
        }
    },[shouldRefresh])

  
  if (loading) return <Loader/>
  return (
    <Container>
        
        <Row gutter={[15, 16]} justify="space-between" align="middle" style={{marginBottom: "30px"}}>
        {/* value={search} onChange={handleSearch} */}
            <Space>
                <SearchInput placeholder="Search by Name"  style={{ width:"100%", marginRight: 20 }} suffix={<SearchOutlined />}></SearchInput>
                <Segmented<string>
                    options={['All', 'Parent', 'Sub-Category']}
                    // value={statusFilter}
                    // onChange={setStatusFilter}
                />
            </Space>
            <NormalButton icon={<PlusOutlined />} onClick={onAddUserClick} style={{width:"150px", height: "45px", backgroundColor: "#000", color: "#FFF", fontWeight: 600}} >Add New </NormalButton>
        </Row>
           
        <Row gutter={[16,16]}>
            <Col span={24}>
                <StyledTable<TicketCategProps> data={categ} columns={columns} rowKey="SystemId" />
            </Col>
        </Row>
    </Container>
  )
}

export default TicketCategoriesTable