import { useMemo } from "react";
import "../styles/userHome.css"
import MainLayout from "./MainLayout";
import { Row, Col, Card, Layout, Divider, Space, Tag, Badge } from 'antd'
import { BookOutlined,ToolOutlined, InboxOutlined, ClockCircleOutlined} from "@ant-design/icons";
import { Link } from 'react-router-dom';
import { useTickets } from "../hooks/ticketing/ticketing_hooks";
import { useAuth } from "../context/AuthContext";
import { Loader } from "../components/Loader";
import { TicketProps } from "../types/Ticketing_drawer";
import { statusColor } from "../utils/StatusTagColor";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { handleLoggedAction } from "../utils/Logger";
import { useApprovalCounter } from "../utils/approvalCounter";
dayjs.extend(relativeTime);
  

const {  Content } = Layout;

const UserHome = () => {
    const { userId } = useAuth();
    const filters = useMemo(() => ({
        requestor: userId ?? undefined,
        status_view: 'open', 
      }), [userId]);
      
    
    const { ticket, loading } = useTickets(filters)
    const { approvalCount }  = useApprovalCounter();

    //console.log(approvalCount)

    if (loading) return <Loader></Loader>
  return (
    <MainLayout title="">
        <div className="user-home">
            {/* HERO */}
            <div className="hero">
                <h1>Welcome to <span style={{color: "#0B5ED7", fontWeight: 700}}> ITOSS v2 </span></h1>
                <p className="subtitle">
                    Access services, manage requests, and get support — all in one place.
                </p>
            </div>
        {/* CONTENT */}
        <Content style={{ padding: "40px" }}>

            {/* QUICK ACTIONS */}
            <Row gutter={[24, 24]} justify="center" className="quick-actions">
                <Col xs={24} md={8}>
                    <Link onClick={() => handleLoggedAction(userId!, 'TICKET CREATION', 'Clicked ticket creation button')} to="/ticketCreation">
                        <Card hoverable className="action-card" >
                            <InboxOutlined className="action-icon" />
                            <h3>Create a ticket</h3>
                            <p>Browse available services</p>
                        </Card>
                    </Link>
                </Col>

                <Col xs={24} md={8}>
                    <Link onClick={() => handleLoggedAction(userId!, 'TICKET APPROVAL', 'Clicked ticket approval button')} to="/ticketApproval">
                    <Card
                        hoverable
                        className="action-card"
                        >
                        <BookOutlined className="action-icon" />

                        <div
                            style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 8,
                            }}
                        >
                            <h3 style={{ margin: 0 }}>Tickets for Review</h3>
                            <Badge count={approvalCount} />
                        </div>

                        <p>Review and approve requests</p>
                        </Card>
                    </Link>
                </Col>

                <Col xs={24} md={8}>
                    <Card hoverable className="action-card">
                    <ToolOutlined className="action-icon" />
                    <h3>Get Help</h3>
                    <p>Report an issue</p>
                    </Card>
                </Col>
            </Row>

            {/* DASHBOARD CARDS */}
            { <Row gutter={[24, 24]} style={{ marginTop: "30px" }}>
            

            <Col xs={24} md={8}>
                <Card title="Open Tickets" className="glass-card">
                    <>
                    {ticket.map((t: TicketProps) => (
                        <div key={t.SystemId}>
                            <div
                                style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "5px 5px",
                            }}
                            >
                                {/* LEFT SIDE */}
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <div style={{ fontWeight: 600, fontSize: "12px" }}>
                                        {t.RequestName}
                                    </div>
                                    <Space>
                                        <span style={{color: "#666", fontSize: "12px"}}> {t.TicketNumber} </span>
                                        <span style={{color: "#666", fontSize: "12px"}}><ClockCircleOutlined /> {dayjs(t.DateCreated).fromNow()}</span>
                                    </Space>
                                </div>
                    
                                {/* RIGHT SIDE */}
                                <Tag color={statusColor(t.Status)} style={{display: "inline-flex",alignItems: "center",justifyContent: "center"}}>
                                    {t.Status}
                                </Tag>
                            </div>
                       
                            <Divider style={{ margin: "4px 0" }} />
                            
                       </div>

                       
                    ))}
                    </>
                </Card>
            </Col>

            {/* <Col xs={24} md={12}>
                <Card title="Announcements" className="glass-card">
                No announcements
                </Card>
            </Col>

            <Col xs={24} md={12}>
                <Card title="Surveys" className="glass-card">
                No surveys available
                </Card>
            </Col> */}
            </Row> }

            </Content>
        </div>
    </MainLayout>
    
  )
}

export default UserHome