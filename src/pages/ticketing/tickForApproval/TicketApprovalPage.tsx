import { useEffect, useMemo, useState } from "react";
import "../../../styles/forApproval.css";
import MainLayout from '../../MainLayout';
import { Statistic, Row, Col, Table, Segmented, Card, Button } from "antd";
import { ColumnsType } from "antd/es/table";
import { useTickets } from "../../../hooks/ticketing/ticketing_hooks";
import { useApprovalHistory } from "../../../hooks/ticketing/ticket_approval_hooks";
import { useTicketApprovers } from "../../../hooks/configuration/ticketApprover_hooks";
import { useAuth } from "../../../context/AuthContext";
import { Loader } from "../../../components/Loader";
import { SearchContainer, SearchInput } from "../../../components/StyledComponents";
import { TicketProps } from "../../../types/Ticketing_drawer";
import { TicketApprover } from "../../../types/TicketsCateg_drawer";
import { SearchOutlined } from "@ant-design/icons";
import TicketApprovalForm from './TicketApprovalForm'
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);


const ApprovalPage: React.FC = () => {
  const { userId } = useAuth();
  const [ search, setSearch ] = useState("");
  const [activeView, setActiveView] = useState<"pending" | "approved" | "declined">("pending");
  const [ filtered, setFiltered ] = useState<TicketProps[]>([])
  const filters = useMemo(() => ({}), []);
  const [ drawerState, setDrawerState ] = useState<{open: boolean; record: TicketProps | null}>({open: false, record: null});


  //TICKETS
  const { ticket, loading, refetch } = useTickets(filters);
  const { approver } = useTicketApprovers();

  const getLevelConfig = (
    ticket: TicketProps,
    config: TicketApprover[]
  ) => {
    return config.find(
      c =>
        c.CategoryId === ticket.RequestType &&
        c.LevelNo === ticket.CurrentLevel + 1
    );
  };
  
  //HISTORY
  const { history, refetch: refetchHistory } = useApprovalHistory ();

  const isCurrentApprover = (
    ticket: TicketProps,
    config: TicketApprover[],
    userId: string
  ) => {
    const levelConfig = getLevelConfig(ticket, config);
  
    if (!levelConfig) return false;
  
    switch (levelConfig.ApproverType) {
      case "Dynamic Superior":
        return ticket.ISId === userId;
  
      case "Dynamic Manager":
        return ticket.DHId === userId;
  
      case "Specific User":
        return levelConfig.ApproverValue === userId;
  
      default:
        return false;
    }
  };

  const refreshUserTable = async () => {
    await Promise.all([
      refetch(),
      refetchHistory()
    ]);
  };

  
  const pendingTickets = useMemo(() => {
    if (!ticket || !userId || !approver) return [];
    

    return ticket.filter(t =>
      (t.Status?.includes("Approved") ||
        t.Status?.includes("Submitted")) &&
      isCurrentApprover(t, approver, userId)
      
    );
  }, [ticket, approver, userId]);

  const approvedTickets = useMemo(() => {
    if (!ticket || !history || !userId) return [];
  
    return ticket.filter(t =>
      history.some((h: any) =>
        h.TicketNumber === t.TicketNumber &&
        h.ApproverId === userId &&
        h.Action?.includes("Approved")
      )
    );
  }, [ticket, history, userId]);

  const declinedTickets = useMemo(() => {
    if (!ticket || !history || !userId) return [];
  
    return ticket.filter(t =>
      history.some((h: any) =>
        h.TicketNumber === t.TicketNumber &&
        h.ApproverId === userId &&
        h.Action?.includes("Declined")
      )
    );
  }, [ticket, history, userId]);

  const onEditClick = (record : TicketProps) => {
    setDrawerState({ open: true, record: record })
  }

  const onClose = () => {
    setDrawerState({
      open: false,
      record: null
    });
  };

  const columns: ColumnsType<TicketProps> = useMemo(() => {
    const baseColumns = [
      { title: "Ticket Number", dataIndex: "TicketNumber", key: "TicketNumber" },
      { title: "Request Type", dataIndex: "RequestName",  key: "RequestName" },
      { title: "Requestor", dataIndex: "RequestorName", key:"RequestorName" },
      { title: "Request For", dataIndex: "RequestForName", key:"RequestForName" },
    ];
  
    if (activeView === "pending") {
      return [
        ...baseColumns,
        {
          title: "Status",
          dataIndex: "Status",
          key: "Status",
        },
        {
          title: "Created On",
          dataIndex: "DateCreated",
          key: "DateCreated",
          render: (text: string) => dayjs(text).fromNow(),
        },
        {
          title:"Action", 
          key:"Action",
          render: (_: any, record: TicketProps) => (
            <Button type="primary" size="small" onClick={() => onEditClick(record)}>Review</Button>
          )

        }
      ];
    }
  
    return [
      ...baseColumns,
      { title: "Action", key: "Action",
        render: (_: any, record: any) => {
          const lastAction = record.approvers?.reduce(
            (latest: any, current: any) => {
              return !latest || current.DateActed > latest.DateActed
                ? current
                : latest;
            },
            null
          );
      
          return lastAction?.Action ?? "-";
        }
      },
      { title: "Date Acted",  key: "DateActed", 
        render: (_: any, record: any) => {
          const lastAction = record.approvers?.reduce(
            (latest: any, current: any) => {
              return !latest || current.DateActed > latest.DateActed
                ? current
                : latest;
            },
            null
          );
      
          return lastAction?.DateActed ? dayjs(lastAction.DateActed).fromNow() : "-";
        }
       },
    ];
  }, [activeView]);



  const tableData = useMemo(() => {
    switch (activeView) {
      case "approved":
        return approvedTickets;
  
      case "declined":
        return declinedTickets;
  
      default:
        return pendingTickets;
    }
  }, [
    activeView,
    pendingTickets,
    approvedTickets,
    declinedTickets,
  ]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =  e.target.value.toLowerCase()
    setSearch(value)
  }

  useEffect(() => {
    const filtered = tableData.filter((t: TicketProps) => {

      return (
        (t.TicketNumber?.toLowerCase() || "").includes(search) ||
        (t.RequestName?.toLowerCase() || "").includes(search) ||
        (t.RequestorName?.toLowerCase() || "").includes(search)
      )
    });
      setFiltered(filtered);
  }, [tableData, search])



  if(loading) return <Loader></Loader>

  return (
    <MainLayout title="" >
      <div className="user-ticket-hero">
          <h1>Tickets for Review</h1>
          <p className="subtitle">
            Review and approve requests
          </p>
      </div>

      
      <div className="card-container">
        <Row gutter={[24,24]} style={{ marginBottom: 16 }} justify="center">
          <Col span={6}><Card hoverable className="card"><Statistic title="Total" value={pendingTickets.length + approvedTickets.length + declinedTickets.length} /></Card></Col>
          <Col span={6}><Card hoverable className="card"><Statistic title="Pending" value={pendingTickets.length} valueStyle={{ color: "#faad14" }} /></Card></Col>
          <Col span={6}><Card hoverable className="card"><Statistic title="Approved" value={approvedTickets.length} valueStyle={{ color: "#52c41a" }} /></Card></Col>
          <Col span={6}><Card hoverable className="card"><Statistic title="Declined" value={declinedTickets.length} valueStyle={{ color: "#ff4d4f" }} /></Card></Col>
        </Row>
      </div>

      <div className="table-grid-container">
          <div className="table-grid-wrapper">
          <SearchContainer >
            <SearchInput placeholder="Search by Ticket Number, Requestor, Request For" style={{ width: "400px" }} suffix={<SearchOutlined />} value={search} onChange={handleSearch} ></SearchInput>
            <Segmented
              style={{ fontSize: "12px" }}
              options={[
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Declined', value: 'declined' },
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
              onRow={() => ({
                style: {
                  fontSize: "12px",
                  cursor: "pointer"
                },
              })}  
              rowKey="TicketNumber"
            ></Table>
          </Row>

          <TicketApprovalForm
            isDrawerOpen={drawerState.open}
            closeDrawer={onClose}
            drawerMode="edit"
            record={drawerState.record}
            onUserAction={refreshUserTable}
          />
          </div>
        </div>
    </MainLayout>
  );
};

export default ApprovalPage;