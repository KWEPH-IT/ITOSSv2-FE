import { useMemo, useState, useEffect } from "react";
import "../../../styles/userRequestTicket.css";
import MainLayout from '../../MainLayout';
import { Row, Table, Segmented } from "antd";
import { ColumnsType } from "antd/es/table";
import { TicketProps } from "../../../types/Ticketing_drawer";
import { useTickets } from "../../../hooks/ticketing/ticketing_hooks";
import { useAuth } from "../../../context/AuthContext";
import { Loader } from "../../../components/Loader";
import { SearchContainer, SearchInput } from "../../../components/StyledComponents";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { useNavigate } from "react-router-dom";

const TicketCreationTable = () => {
  const { userId } = useAuth();
  const filters = useMemo(() => ({
      requestor: userId ?? undefined,
    }), [userId]);
  const [ activeView, setActiveView ] = useState<'open' | 'closed'>('open');
  const [ search, setSearch ] = useState("");
  const [ filtered, setFiltered ] = useState<TicketProps[]>([]);
  const navigate = useNavigate();
  
  
  const { ticket, loading } = useTickets(filters)

  const columns : ColumnsType<TicketProps> = [
    {
      title: "Ticket No.",
      dataIndex: "TicketNumber",
      key: "TicketNumber"
    },
    {
      title: "Request Type",
      dataIndex: "RequestName",
      key: "RequestName"
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status"
    },
    {
      title: "Date Created",
      dataIndex: "DateCreated",
      key: "DateCreated",
      render: (text: string) => dayjs(text).fromNow(),
    }
  ]

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) =>{
    const value = event.target.value.toLowerCase();
    setSearch(value);
  };

  useEffect(() => {
    const filtered = ticket.filter((sys: TicketProps) => {
  
      const matchesSearch =
        (sys.TicketNumber?.toLowerCase() || "").includes(search) ||
        (sys.RequestName?.toLowerCase() || "").includes(search);
  
      const matchesView =
        activeView === "open"
          ? sys.Status !== "Closed"
          : sys.Status === "Closed";
  
      return matchesSearch && matchesView;
    });
  
    setFiltered(filtered);
  
  }, [ticket, search, activeView]);


  if(loading) return <Loader/>
  return (
    <MainLayout title="">
        {/* HERO */}
        <div className="user-ticket-hero">
            <h1>Request Overview</h1>
            <p className="subtitle">
              View and manage all submitted requests in one place
            </p>
        </div>

        <div className="table-grid-container">
         
          <SearchContainer >
            <SearchInput placeholder="Search by Ticket Number, Request Type" style={{ width: "400px" }} suffix={<SearchOutlined />} value={search} onChange={handleSearch}></SearchInput>
            <Segmented
              style={{ fontSize: "12px" }}
              options={[
                { label: 'Open requests', value: 'open' },
                { label: 'Closed requests', value: 'closed' },
              ]}
              value={activeView}
              onChange={(value) => setActiveView(value as any)}
            />
          </SearchContainer>
       


          <Row gutter={[24, 24]} justify="center">
            <Table<TicketProps> 
              className="table"
              pagination={{ size: "small" }}
              columns={columns} 
              dataSource={filtered} 
              style={{ width: "100%" }}
              onRow={(record:TicketProps) => ({
                style: {
                  fontSize: "12px",
                  cursor: "pointer"
                },

                onClick: () => {
                  navigate(`/ticketDetails/${btoa(record.TicketNumber)}`) 
                }
              })}  
              rowKey="TicketNumber"
            ></Table>
          </Row>
        </div>

       

        
    </MainLayout>
  )
}

export default TicketCreationTable