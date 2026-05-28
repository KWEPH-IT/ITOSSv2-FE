import "../../../styles/userRequestTicket.css"
import MainLayout from '../../MainLayout'
import { Row, Col, Card, Button } from 'antd'
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { useTicketCategs } from "../../../hooks/configuration/ticketCateg_hooks"
import { TicketCategProps } from "../../../types/TicketsCateg_drawer"
import { useNavigate } from "react-router-dom";

const TicketPage = () => {
  const { categ } = useTicketCategs();

  const ParentCategs = categ?.filter((item: TicketCategProps) => item.ParentId === null)
  const navigate = useNavigate();

  return (
    <MainLayout title="">
        {/* HERO */}
        <div className="user-ticket-hero">
            <h1>Create a Ticket </h1>
            <p className="subtitle">
              Submit a request or report an issue.
            </p>
        </div>

        <div className="card-container">
          <Row gutter={[24, 24]} justify="center" >
           
            { ParentCategs?.map((i : TicketCategProps) => {
              return(
               <Col xs={24} md={8}>
                <Card hoverable className="card" >
                  {/* <InboxOutlined className="action-icon" /> */}
                  <h3>{i.Name}</h3>
                  <p>{i.Description}</p>
                </Card>
              </Col>
              )
            }) }
              
          </Row>
        </div>

        <Row gutter={[24, 24]} justify="center" style={{ marginTop: 20 }}>
          <div className="action-buttons">
            <Button className="btn-secondary" onClick={() => navigate('/user-home')} icon={<ArrowLeftOutlined />}>
              Go Back
            </Button>

            <Button type="primary" className="btn-primary" onClick={() => navigate('/createRequest')} icon={<PlusOutlined />}>
              Create Request
            </Button>
          </div>
        </Row>

        
    </MainLayout>
  )
}

export default TicketPage