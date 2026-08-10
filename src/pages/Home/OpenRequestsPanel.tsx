import React, { useMemo } from "react";
import { Row, Col, Tag, Badge } from "antd";
import { Loader } from "../../components/Loader";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SyncOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useTickets } from "../../hooks/ticketing/ticketing_hooks";
import { useAuth } from "../../context/AuthContext";
import { TicketProps } from "../../types/Ticketing_drawer";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { useNavigate } from "react-router-dom";

/* ---------- Stat cards ---------- */

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  bgColor: string;
  iconBgColor: string;
  iconColor: string;
  valueColor: string;
}

type DashboardStatus = "Pending" | "Assigned" | "Processing";

const getDashboardStatus = (status: string): DashboardStatus => {
  switch (status) {
    case "Pending":
    case "Approved by DH":
    case "Approved by IT Manager":
    case "Approved by HR":
    case "Submitted":
      return "Pending";

    case "Assigned":
      return "Assigned";

    case "On Process":
      return "Processing";

    default:
      return "Pending";
  }
};

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  bgColor,
  iconBgColor,
  iconColor,
  valueColor,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: bgColor,
      borderRadius: 12,
      padding: "14px 18px",
      height: "100%",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: iconBgColor,
        color: iconColor,
        fontSize: 16,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
      <span style={{ fontSize: 20, fontWeight: 700, color: valueColor }}>
        {value}
      </span>
      <span style={{ fontSize: 12, color: "#8c8c8c" }}>{label}</span>
    </div>
  </div>
);

/* ---------- Request list ---------- */

const statusStyles: Record<
  DashboardStatus,
  { label: string; bg: string; color: string; iconBg: string; icon: React.ReactNode }
> = {
  Pending: {
    label: "Pending Approval",
    bg: "#FCE8D4",
    color: "#B96A1F",
    iconBg: "#FCE8D4",
    icon: <ClockCircleOutlined style={{ color: "#F2994A" }} />,
  },
  Assigned: {
    label: "Assigned",
    bg: "#D6E8FD",
    color: "#1B62C4",
    iconBg: "#D6E8FD",
    icon: <UserOutlined style={{ color: "#2F80ED" }} />,
  },
  Processing: {
    label: "On Process",
    bg: "#E9DFF7",
    color: "#7B3FC4",
    iconBg: "#E9DFF7",
    icon: <SyncOutlined style={{ color: "#9B51E0" }} />,
  },
};

const RequestRow: React.FC<{ item: TicketProps; isLast: boolean }> = ({
  item,
  isLast,
}) => {
  const dashboardStatus = getDashboardStatus(item.Status);
  const s = statusStyles[dashboardStatus];
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 4px",
        borderBottom: isLast ? "none" : "1px solid #F0F0F0",
        cursor: "pointer",
      }}
      onClick={() => navigate(`/ticketDetails/${btoa(item.TicketNumber)}`)}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: s.iconBg,
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {s.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#222" }}>
            {item.TicketNumber}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#595959" }}>{item.RequestName}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, minWidth: 140 }}>
        <Tag
          style={{
            background: s.bg,
            color: s.color,
            border: "none",
            borderRadius: 6,
            fontWeight: 500,
            margin: 0,
          }}
        >
          {s.label}
        </Tag>
        <div style={{ fontSize: 12, color: "#8c8c8c" }}>{item.Status}</div>
      </div>

      <div style={{ textAlign: "right", minWidth: 90, fontSize: 12, color: "#8c8c8c" }}>
        <div>{dayjs(item.DateCreated).fromNow()}</div>
      </div>

      <RightOutlined style={{ color: "#bfbfbf", fontSize: 12 }} />
    </div>
  );
};

/* ---------- Panel ---------- */

const OpenRequestsPanel: React.FC = () => {
  const { userId } = useAuth();

  const filters = useMemo(
    () => ({
      requestor: userId ?? undefined,
      status_view: "open",
    }),
    [userId]
  );

  const { ticket, loading } = useTickets(filters);

  // Guard against ticket being undefined/null before the hook resolves,
  // even outside the `loading` window (e.g. initial render, refetches).
  const tickets = ticket ?? [];

  const statusCounts = useMemo(() => {
    const counts: Record<DashboardStatus, number> = {
      Pending: 0,
      Assigned: 0,
      Processing: 0,
    };

    tickets.forEach((item) => {
      const dashboardStatus = getDashboardStatus(item.Status);
      counts[dashboardStatus] += 1;
    });

    return counts;
  }, [tickets]);

  const stats: StatCardProps[] = useMemo(
    () => [
      {
        icon: <ClockCircleOutlined />,
        value: statusCounts.Pending,
        label: "Pending Approval",
        bgColor: "#FDF3E7",
        iconBgColor: "#FCE8D4",
        iconColor: "#F2994A",
        valueColor: "#F2994A",
      },
      {
        icon: <UserOutlined />,
        value: statusCounts.Assigned,
        label: "Assigned",
        bgColor: "#EAF2FE",
        iconBgColor: "#D6E8FD",
        iconColor: "#2F80ED",
        valueColor: "#2F80ED",
      },
      {
        icon: <SyncOutlined />,
        value: statusCounts.Processing,
        label: "On Process",
        bgColor: "#F5F0FB",
        iconBgColor: "#E9DFF7",
        iconColor: "#9B51E0",
        valueColor: "#9B51E0",
      },
    ],
    [statusCounts]
  );

  if (loading) return <Loader />;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileTextOutlined style={{ color: "#2F80ED", fontSize: 18 }} />
          <span style={{ fontWeight: 700, fontSize: 16, color: "#222" }}>Open Requests</span>
          <Badge count={tickets.length} />
        </div>
        <a
          href="#"
          style={{ fontSize: 13, color: "#2F80ED", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}
        >
          View all requests <RightOutlined style={{ fontSize: 10 }} />
        </a>
      </div>

      {/* Stat cards */}
      <Row gutter={16} style={{ marginBottom: 8 }}>
        {stats.map((stat, idx) => (
          <Col xs={24} sm={8} key={idx}>
            <StatCard {...stat} />
          </Col>
        ))}
      </Row>

      {/* Request list */}
      <div style={{ marginTop: 8 }}>
        {tickets.map((item, idx) => (
          <RequestRow key={item.id} item={item} isLast={idx === tickets.length - 1} />
        ))}
      </div>
    </div>
  );
};

export default OpenRequestsPanel;