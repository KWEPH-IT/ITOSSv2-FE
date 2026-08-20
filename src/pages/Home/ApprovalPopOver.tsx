import { Button, Empty, List, Typography } from "antd";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { TicketProps } from "../../types/Ticketing_drawer";
import { TicketApprover } from "../../types/TicketsCateg_drawer";

const { Text } = Typography;

interface ApprovalListProps {
  tickets: TicketProps[];
  approver: TicketApprover[];
}

type TicketState = "assigned" | "unassigned" | "approval";

const getMaxLevel = (
  ticket: TicketProps,
  config: TicketApprover[]
): number => {
  const levelsForCategory = config
    .filter((c) => c.CategoryId === ticket.RequestType)
    .map((c) => c.LevelNo);

  return levelsForCategory.length ? Math.max(...levelsForCategory) : 0;
};

const getTicketState = (
  ticket: TicketProps,
  config: TicketApprover[]
): TicketState => {
  if (ticket.Status === "Assigned") {
    return "assigned";
  }

  const isEmpty = !ticket.AssignedTo || ticket.AssignedTo === "";

  const maxLevel = getMaxLevel(ticket, config);

  const hasReachedMaxLevel =
    maxLevel > 0 && ticket.CurrentLevel >= maxLevel;

  if (isEmpty && hasReachedMaxLevel) {
    return "unassigned";
  }

  return "approval";
};

const stateConfig: Record<
  TicketState,
  {
    label: string;
    color: string;
    background: string;
    icon: React.ReactNode;
  }
> = {
  assigned: {
    label: "Assigned",
    color: "#5B7FE2",
    background: "#F1F4FC",
    icon: <CheckCircleOutlined />,
  },

  unassigned: {
    label: "Unassigned",
    color: "#D59645",
    background: "#FBF6ED",
    icon: <ExclamationCircleOutlined />,
  },

  approval: {
    label: "For Approval",
    color: "#55A17B",
    background: "#EEF7F2",
    icon: <ClockCircleOutlined />,
  },
};

const ApprovalList = ({
  tickets,
  approver,
}: ApprovalListProps) => {
  const navigate = useNavigate();

  const handleOpen = (
    ticket: TicketProps,
    state: TicketState
  ) => {
    if (state === "approval") {
      navigate("/ticketApproval");
    } else {
      navigate(`/ticketDetails/${btoa(ticket.TicketNumber)}`);
    }
  };

  if (!tickets.length) {
    return (
      <div
        style={{
          width: 430,
          padding: "48px 20px",
          background: "#FAFBFC",
          borderRadius: 16,
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text
              style={{
                fontSize: 13,
                color: "#9AA1AC",
                fontWeight: 400,
              }}
            >
              No pending approvals
            </Text>
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: 430,
        maxHeight: 500,
        overflowY: "auto",
        padding: "8px",
        background: "#F8F9FB",
        borderRadius: 16,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "6px 7px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Text
              style={{
                display: "block",
                fontSize: 15,
                lineHeight: "20px",
                fontWeight: 500,
                color: "#30343B",
                letterSpacing: "-0.1px",
              }}
            >
              Pending approvals
            </Text>

            <Text
              style={{
                display: "block",
                marginTop: 3,
                fontSize: 11.5,
                lineHeight: "17px",
                fontWeight: 400,
                color: "#9AA1AC",
              }}
            >
              Tickets waiting for your attention
            </Text>
          </div>

          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 24,
              height: 24,
              padding: "0 7px",
              borderRadius: 12,
              background: "#EEF2FF",
              color: "#6682D7",
              fontSize: 10.5,
              fontWeight: 500,
            }}
          >
            {tickets.length}
          </span>
        </div>
      </div>

      {/* TICKETS */}
      <List
        dataSource={tickets}
        split={false}
        renderItem={(ticket) => {
          const state = getTicketState(ticket, approver);
          const cfg = stateConfig[state];

          return (
            <List.Item
              onClick={() => handleOpen(ticket, state)}
              style={{
                display: "block",
                padding: 0,
                marginBottom: 8,
                borderRadius: 13,
                border: "1px solid #EAECF0",
                background: "#FFFFFF",
                cursor: "pointer",
                overflow: "hidden",
                transition:
                  "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-1px)";

                e.currentTarget.style.boxShadow =
                  "0 5px 16px rgba(30, 40, 60, 0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "translateY(0)";

                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "13px 12px",
                  gap: 11,
                }}
              >
                {/* ICON */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    minWidth: 34,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    background: cfg.background,
                    color: cfg.color,
                    fontSize: 14,
                  }}
                >
                  {cfg.icon}
                </div>

                {/* CONTENT */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Text
                    ellipsis={{
                      tooltip: ticket.RequestName,
                    }}
                    style={{
                      display: "block",
                      fontSize: 12,
                      lineHeight: "18px",
                      fontWeight: 500,
                      color: "#3E434B",
                    }}
                  >
                    {ticket.RequestName}
                  </Text>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 3,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10.5,
                        lineHeight: "15px",
                        color: "#9AA1AC",
                        fontWeight: 400,
                      }}
                    >
                      {ticket.TicketNumber}
                    </Text>

                    <span
                      style={{
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        background: "#D5D9E0",
                      }}
                    />

                    <Text
                      ellipsis={{
                        tooltip: ticket.RequestorName,
                      }}
                      style={{
                        maxWidth: 120,
                        fontSize: 10.5,
                        lineHeight: "15px",
                        color: "#9AA1AC",
                        fontWeight: 400,
                      }}
                    >
                      {ticket.RequestorName}
                    </Text>
                  </div>
                </div>

                {/* STATUS */}
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: 12,
                    background: cfg.background,
                    color: cfg.color,
                    fontSize: 9.5,
                    lineHeight: "14px",
                    fontWeight: 450,
                    whiteSpace: "nowrap",
                  }}
                >
                  {cfg.label}
                </span>

                {/* ARROW */}
                <Button
                  type="text"
                  shape="circle"
                  icon={
                    <ArrowRightOutlined
                      style={{
                        fontSize: 9,
                        color: "#B4BAC4",
                      }}
                    />
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpen(ticket, state);
                  }}
                  style={{
                    width: 25,
                    height: 25,
                    minWidth: 25,
                    padding: 0,
                    background: "#F7F8FA",
                  }}
                />
              </div>
            </List.Item>
          );
        }}
      />

      {/* FOOTER */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: 2,
        }}
      >
        <Button
          type="text"
          onClick={() => navigate("/ticketApproval")}
          style={{
            height: 30,
            padding: "0 10px",
            color: "#7F8794",
            fontSize: 11.5,
            fontWeight: 400,
            borderRadius: 8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#5B7FE2";
            e.currentTarget.style.background = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#7F8794";
            e.currentTarget.style.background =
              "transparent";
          }}
        >
          View all approvals
          <ArrowRightOutlined
            style={{
              marginLeft: 5,
              fontSize: 9,
            }}
          />
        </Button>
      </div>
    </div>
  );
};

export default ApprovalList;