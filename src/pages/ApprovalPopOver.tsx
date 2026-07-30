import { Avatar, Button, Empty, List } from "antd";
import {
  BookOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { TicketProps } from "../types/Ticketing_drawer";

interface ApprovalListProps {
  tickets: TicketProps[];
}

const ApprovalList = ({ tickets }: ApprovalListProps) => {
  const navigate = useNavigate();

  if (!tickets.length) {
    return (
      <Empty
        description="No pending approvals"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div
      style={{
        width: 420,
        maxHeight: 450,
        overflowY: "auto",
      }}
    >
      <List
        itemLayout="horizontal"
        dataSource={tickets}
        renderItem={(ticket) => (
          <List.Item
            actions={[
              <Button
                    key="open"
                    type="link"
                    icon={<ArrowRightOutlined />}
                    onClick={() => {
                        if (ticket.Status === "Assigned") {
                        navigate(`/ticketDetails/${btoa(ticket.TicketNumber)}`);
                        } else {
                        navigate(`/ticketApproval`);
                        }
                    }}
                    >
                    Open
                </Button>
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={<BookOutlined />}
                  style={{ background: "#1677ff" }}
                />
              }
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12
                  }}
                >
                  <span>{ticket.TicketNumber}</span>

                </div>
              }
              description={
                <>
                  <div>
                    <strong style={{fontSize: 12}}>{ticket.RequestName}</strong>
                  </div>

                  <div style={{fontSize: 12}}>
                    Requestor: {ticket.RequestorName}
                  </div>

                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default ApprovalList;