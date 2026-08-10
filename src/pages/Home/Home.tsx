import { useMemo } from "react";
import MainLayout from "../MainLayout";
import { getUserData } from "../../hooks/user_hooks";
import { useAuth } from "../../context/AuthContext";
import "../../styles/home.css";
import { NormalCase } from "../../utils/stringFormat";
import { Card, Row, Col } from "antd";
import { CheckOutlined, CloseOutlined, ContainerOutlined  } from "@ant-design/icons";
import { useTickets } from "../../hooks/ticketing/ticketing_hooks";
import { Loader } from "../../components/Loader";
//import { TicketProps } from "../types/Ticketing_drawer";

const Home = () => {
  const { userId }  = useAuth();
  const { userData, loading } = getUserData(userId);
  const filters = useMemo(() => ({}), []);
  const { ticket, loading: tLoading } = useTickets(filters)

  const unAssignedTickets = useMemo(() => {
    if (!ticket) return [];
  
    return ticket.filter(t =>
      t.Status?.includes("Approved") &&
      (!t.AssignedTo?.trim())
    );
  }, [ticket]);

  const assignedTickets = useMemo(() => {
    if (!ticket) return [];
  
    return ticket.filter(t =>
      t.Status?.includes("Assigend") &&
      (t.AssignedTo?.trim())
    );
  }, [ticket]);


  const closedTickets = useMemo(() => {
    if (!ticket) return [];
  
    return ticket.filter(t =>
      t.Status?.includes("Closed") 
    );
  }, [ticket]);

  if (!userId) {
    return <p>User not logged in. Redirect to login.</p>;
  }
  
  if (loading && tLoading) return <Loader></Loader>;
  if (!userData) return <p>No user data found.</p>;

  return (
    <MainLayout title="Dashboard">
      <>
      <Row gutter={[16,16]}>
        <div className="welcome-banner">
          <div className="welcome-banner__content">
            <h1 className="welcome-banner__title">
              Welcome back, <span>{NormalCase(userData.FirstName)}!</span> 
            </h1>

            <p className="welcome-banner__subtitle">
              Here’s what’s happening with your system today.
            </p>

            {/* <div className="welcome-banner__chip">
              📧 reginamaye.banadera@kwe.com
            </div> */}
          </div>

          <div className="welcome-banner__illustration"></div>
        </div>
      </Row>

      <Row gutter={[16,16]} style={{ marginTop: 20 }}>
        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #ffd666, #fa8c16)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <CloseOutlined />
                </div>

                <div>
                  <div style={{ fontWeight: 600 }}>Unassigned Tickets</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{unAssignedTickets.length}</div>
                </div>
              </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <CheckOutlined />
                </div>

                <div>
                  <div style={{ fontWeight: 600 }}>Assigned Tickets</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{assignedTickets.length}</div>
                </div>
              </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card style={{ borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #52c41a, #237804)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <ContainerOutlined />
                </div>

                <div>
                  <div style={{ fontWeight: 600 }}>Closed Tickets</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{closedTickets.length}</div>
                </div>
              </div>
          </Card>
        </Col>
      </Row>

      
      </>
    </MainLayout>
  );
  
};

export default Home;
