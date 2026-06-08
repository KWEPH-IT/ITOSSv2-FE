import React from "react";
import { Layout, Menu } from "antd";
import { HomeFilled, SettingFilled, TagsFilled } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/sidebar.css"; // 🔥 new CSS file for modern look

const { Sider } = Layout;

const items = [
  {
    key: "/home-redirect",
    icon: <HomeFilled className="app-sider-icon" />,
    label: "Home",
  },
  {
    key: "config",
    icon: <SettingFilled className="app-sider-icon" />,
    label: "Configuration",
    children: [
      { key: "/configDBColumns", label: "Database Columns" },
      { 
        key: "/configEmail", 
        label: "Email Setup",
        children: [
          { key: "/configEmailAddress", label: "User Email List" },
          { key: "/configGroupEmails", label: "Group Emails" },
        ]
      },
      { key: "/configUserManagement", label: "User Management" }, 
      { key: "/configSystemProfile", label: "System Profile" },
      { key: "/configTicketCateg", label: "Ticket Categories" },
    ],
  },
  {
    key: "inventory",
    icon: <TagsFilled  className="app-sider-icon" />,
    label: "Inventory",
    children: [
      { key: "/invAssetReq", label: "Asset Requisition" },
      { key: "/invEquipment", label: "Equipment" },
    ],
  },

  {
    key: "ticket",
    icon: <TagsFilled  className="app-sider-icon" />,
    label: "Ticket",
    children: [
      { key: "/ticketCreation", label: "Ticket Creation" },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const onClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={260}
      className="modern-sider"
    >
      {/* LOGO */}
      <div className="logo-container-sidebar">
        <img
          src="/images/logo.png"
          alt="Logo"
          className={`sidebar-logo ${collapsed ? "collapsed" : ""}`}
        />
      </div>

      {/* MENU */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={onClick}
        className="modern-menu"
      />
    </Sider>
  );
};

export default Sidebar;
