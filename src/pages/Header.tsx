import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { Layout, Avatar, Dropdown, message, Button, Space, Typography, Divider } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Loader } from '../components/Loader'; 
import "../styles/header.css"
import { formatName, getInitials } from '../utils/stringFormat';
import API from '../api/api';
import { handleLoggedAction } from '../utils/Logger';
const { Header } = Layout;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (value:boolean) =>void;
  userId: string;
  userName: string;
  dept: string;
  userGroup: string;
}

const AppHeader: React.FC<HeaderProps> = ({collapsed, setCollapsed, userId, userName, dept, userGroup}) => {
  const displayName = formatName(userName);
  const [isLoading, setIsLoading] = useState(false);


  const handleLogout = async() =>{
    try{
      setIsLoading(true);
      await API.post(`/auth/logout`);
      message.success("Logged out successfully!");

      window.location.href = '/';
    }
    catch(error){
      console.error(error)
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
    <Header className={dept === 'IT' ? 'app-header' : 'user-app-header'}>
      
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
          { dept === 'IT' ? 
            (
              <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  style={{ fontSize: '18px', width: 40, height: 40 }}
                />

            )
            :
            <Link to="/home-redirect">
              <span style={{ color: "#FFF", fontSize:"35px", fontWeight: 700}}> ITOSS v2 </span>
            </Link>
          }
          </div>
       

      

      {/* USER PROFILE ON THE RIGHT */}
      
      <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "50px" }}>
        {/* Bell icon */}
        <Link to="/ticketList" onClick={() => handleLoggedAction(userId, "REQUEST OVERVIEW", "Clicked list of requests")}>
          <Button type='link' style={{color:dept === 'IT' ? '#000' : '#FFFF', fontWeight: 600 }}>Requests</Button>
        </Link>
        {/* <BellFilled style={{ fontSize: 18, cursor: "pointer", color: "#8c8c8c" }} /> */}

        {/* Separator line */}
        <Divider type="vertical" style={{ height: "20px", margin: 0 }} />

        {/* Name + Avatar as dropdown trigger */}
        <Dropdown
          menu={{ items }}
        >
          <Space style={{ cursor: "pointer" }}>
            <Avatar
              style={{ background: dept === 'IT' ? 'linear-gradient(135deg, #ffb347, #ff5e62)' : '#FFFF', color:dept === 'IT' ? '#FFF' : '#000', fontWeight: 600, marginRight: "10px" }}
            >
                {getInitials(displayName)}
            </Avatar>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 0.7 }}>
              <Typography.Text style={{ color: dept === "IT" ? "#000" : "#FFF", fontWeight: 600}}>{displayName}</Typography.Text>

              <Typography.Text style={{ color: dept === "IT" ? "#000" : "#FFF", fontWeight: 300, fontSize: 12,}}>{userGroup}</Typography.Text>
            </div>
          </Space>
        </Dropdown>
      </div>
    </Header>
  )
}

export default AppHeader