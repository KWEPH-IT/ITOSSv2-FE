import React, { useState } from 'react'
import axios from 'axios';
import { Layout, Menu, Avatar, Dropdown, message, Button, Space, Typography, Divider } from "antd";
import { UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BellFilled } from "@ant-design/icons";
import { Loader } from '../components/Loader'; 
import "../styles/header.css"
import { formatName } from '../utils/stringFormat';



const { Header } = Layout;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (value:boolean) =>void;
  userName: string;
}

const AppHeader: React.FC<HeaderProps> = ({collapsed, setCollapsed, userName}) => {
  const displayName = formatName(userName);
  const API_URL = import.meta.env.VITE_API_URL; 
  const [isLoading, setIsLoading] = useState(false);


  const handleLogout = async() =>{
    try{
      setIsLoading(true);
      await axios.post(`${API_URL}/auth/logout`, {}, {withCredentials: true})
      message.success("Logged out successfully!");

      window.location.href = '/';
    }
    catch{
      message.error("Unable to log out!")
    }
    finally{
      setIsLoading(false)
    }
  };


  const items = [
    {
      key: "1",
      label: "Profile",
    },
    {
      key: "2",
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  if (isLoading) return <Loader/> 
  return (
    <Header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
      <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ fontSize: '18px', width: 40, height: 40 }}
        />
      </div>

      

      {/* USER PROFILE ON THE RIGHT */}
      
      <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "50px" }}>
        {/* Bell icon */}
        <BellFilled style={{ fontSize: 18, cursor: "pointer", color: "#8c8c8c" }} />

        {/* Separator line */}
        <Divider type="vertical" style={{ height: "20px", margin: 0 }} />

        {/* Name + Avatar as dropdown trigger */}
        <Dropdown
          menu={{ items }}
        >
          <Space style={{ cursor: "pointer" }}>
            <Avatar
              style={{ backgroundColor: "#fa8c16", marginRight: "10px" }}
              icon={<UserOutlined />}
            />
            <Typography.Text>{displayName}</Typography.Text>
          </Space>
        </Dropdown>
      </div>
    </Header>
  )
}

export default AppHeader