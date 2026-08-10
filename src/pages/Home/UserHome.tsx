import "../../styles/userHome.css"
import MainLayout from "../MainLayout";
import { Row, Col, Card, Layout,  Badge,} from 'antd'
import { BookOutlined,ToolOutlined, InboxOutlined, } from "@ant-design/icons";
import { Link } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { handleLoggedAction } from "../../utils/Logger";
import { useApprovalCounter } from "../../utils/approvalCounter";
import OpenRequestsPanel from "../Home/OpenRequestsPanel";
import TicketsForProcessing from "./TicketForProcessing";
dayjs.extend(relativeTime);
  

const {  Content } = Layout;





const UserHome = () => {
    const { userId } = useAuth();
    const { approvalCount }  = useApprovalCounter();

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
                            minHeight: 26
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
                <Col md={12} sm={24}>
                    <OpenRequestsPanel/>
                </Col>
                { userId === 'K656' ? 
                    (<Col md={12} sm={24}>
                        <TicketsForProcessing/>
                    </Col>) : null
                }
            </Row> }

            </Content>
        </div>
    </MainLayout>
    
  )
}

export default UserHome