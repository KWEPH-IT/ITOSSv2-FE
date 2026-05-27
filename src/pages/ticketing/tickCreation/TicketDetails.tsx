import { useMemo, useState } from 'react';
import MainLayout from '../../MainLayout'
import "../../../styles/userTicketDetails.css";
import { Card, Row, Col, Tag, Typography, Divider, Avatar, Tabs, Space, Button, Dropdown, message } from 'antd';
import { StyledTextArea } from '../../../components/StyledComponents';
import { useParams } from 'react-router-dom';
import { useTickets } from '../../../hooks/ticketing/ticketing_hooks';
import { Loader } from '../../../components/Loader';
import { getInitials } from '../../../utils/stringFormat';
import { SendOutlined, FlagOutlined, DownOutlined, CloseOutlined } from "@ant-design/icons";
import { formatLabel, renderValue } from '../../../utils/valueNormalizer';
import { TicketMessage } from '../../../types/Ticketing_drawer';
import { handleLoggedAction } from '../../../utils/Logger';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/api';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { MenuProps } from 'antd';
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

const { Title, Text } = Typography

const TicketDetails = () => {
    const { tn } = useParams();
    const decoded_tn = tn ? atob(tn) : "";

    const { userId } = useAuth();

    const filters = useMemo(() => ({
        ticketno: decoded_tn ?? undefined,
    }), [decoded_tn]);
    const [ mensahe, setMessage ] = useState(""); 

    const { ticket, loading, refetch } = useTickets(filters)
    const selectedTicket = ticket?.[0];
    const messages = [...(ticket?.[0]?.messages || []) as TicketMessage[]].sort(
        (a: TicketMessage, b: TicketMessage) =>
          new Date(b.DateSent).getTime() - new Date(a.DateSent).getTime()
      );
    const fields = selectedTicket?.custom_fields?.[0]?.CustomFields || {};

    const EXCLUDED_FIELDS = ["EmployeeId", "SystemName", "category"]
    
    const handleTabChange = (key: string) => {
        if (key === "1") {
          handleLoggedAction(
            userId!,
            "TICKET ACTIVITY",
            "Clicked ticket activity."
          );
        }
        else if(key === "2") {
            handleLoggedAction(
                userId!,
                "TICKET DETAILS",
                "Clicked ticket details."
              );
        }
      };

    const items: MenuProps['items'] = [
        {
          label: 'Re-send Request',
          key: '1',
          icon: <SendOutlined />,
        },
        {
          label: 'Cancel Request',
          key: '2',
          icon: <CloseOutlined />,
        },
    ];


    const handleMenuClick: MenuProps["onClick"] = async(info) => {
        if(info.key === "1"){
            //RESENDING REQUEST
            try{
                handleLoggedAction(userId!, 'TICKET RE-SEND', "Clicked Re-send Request button")
                const response = await API.post(`/api/re-send`, {
                    ticket_no: decoded_tn,
                    requestorName: selectedTicket?.RequestorName,
                    requestType: selectedTicket?.RequestName
                });
                message.success(response.data.message);
    
                await refetch();
            }
            catch(e: any){
                console.error(e);
                message.error( e.response?.data?.message || "Failed to send message")
            }
        }

        else if(info.key === "2"){
            try{
                handleLoggedAction(userId!, 'TICKET CANCELLATION', "Clicked Cancel Request button")
                const response = await API.post(`/api/cancel`, {
                    ticket_no: decoded_tn,
                });
                message.success(response.data.message);
    
                await refetch();
            }
            catch(e: any){
                console.error(e);
                message.error( e.response?.data?.message || "Failed to send message")
            }
        }
    }

    const menuProps = {
        items,
        onClick: handleMenuClick,
      };

    const handleSubmitMessage = async() => {
        try{
            if(!mensahe){
                message.warning("Not message typed");
                return;
            }
            handleLoggedAction(userId!, 'SENT MESSAGE', "Sent message to the assigned IT personnel")
            const response = await API.post(`/api/message`, {
                ticket_no: decoded_tn,
                message: mensahe,
            });
            message.success(response.data.message);

            setMessage("")
            await refetch();
        }
        catch(e: any){
            console.error(e);
            message.error(
                e.response?.data?.message || "Failed to send message"
            );
        }
    }   

    

    if (loading) return <Loader></Loader>
    if (!ticket || ticket.length === 0) return <div>No ticket found</div>;
  return (
    <MainLayout title="">
        <div className="grid-container">
        <div className="grid-wrapper">
            <Card className="card">
                {/* TOP SECTION */}
                <Row justify="space-between" align="top">
                    <Col>
                        <Tag color="blue" style={{ padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,}}>
                            {decoded_tn}
                        </Tag>
                        <Title style={{ marginTop: 10, marginBottom: 0, fontSize:28, fontWeight: 700, lineHeight: 1.2, color: "#172B4D",}}>
                            {selectedTicket?.RequestName}
                        </Title>
                    </Col>
                    <Col>
                        <Row gutter={40} align="middle">
                            <Col>
                                <Text type="secondary" style={{ fontSize: 12 }}>Created</Text>
                                <br />
                                <Text strong style={{ fontSize: 12 }}>
                                    {dayjs(selectedTicket?.DateCreated).fromNow()}
                                </Text>
                            </Col>
                            { selectedTicket.DateModified?  
                                <Col>
                                    <Text type="secondary">Updated</Text>
                                    <br />
                                    <Text strong style={{ fontSize: 12 }}>
                                        {dayjs(selectedTicket?.DateModified).fromNow()}
                                    </Text>
                                </Col>
                                : 
                                null
                            }

                            <Col>
                                <Text type="secondary" style={{ fontSize: 12 }}>Status</Text>
                                <br />
                                <Tag
                                    color="success"
                                    style={{
                                    fontSize: 12,
                                    }}
                                >
                                    {selectedTicket?.Status}
                                </Tag>
                            </Col>
                    
                           <Col>
                                <Dropdown menu={menuProps}>
                                    <Button 
                                        style={{
                                            borderRadius: 12,
                                            height: 40,
                                            paddingInline: 22,
                                            fontWeight: 500,
                                        }} 
                                        icon={<DownOutlined />}>
                                        Actions
                                    </Button>
                                </Dropdown>

                                
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Divider style={{ margin: "28px 0" }} />
                
                <Row gutter={35} align="middle">
                    <Col>
                        <Avatar
                            size={48}
                            style={{
                            background: "#0F218B",
                            color: "#FFF",
                            fontWeight: 700,
                            }}
                        >
                            {getInitials(selectedTicket?.RequestorName)}
                        </Avatar>
                    </Col>

                    <Col>
                        <Text type="secondary">Requestor</Text>
                    <br />
                        <Text strong style={{ fontSize: 12 }}>
                            {selectedTicket?.RequestorName}
                        </Text>
                    </Col>

                    <Col>
                        <Avatar
                            size={48}
                            style={{
                            background: "#ff9248",
                            color: "#FFF",
                            fontWeight: 700,
                            }}
                        >
                            {getInitials(selectedTicket?.RequestForName)}
                        </Avatar>
                    </Col>

                    <Col>
                        <Text type="secondary">Request For</Text>
                    <br />
                        <Text strong style={{ fontSize: 12 }}>
                            {selectedTicket?.RequestForName}
                        </Text>
                    </Col>
                </Row>
            </Card>


            <Card className='card'>
            <Tabs
                defaultActiveKey="1"
                size="large"
                onChange={handleTabChange}
                items={[
                {
                    key: "1",
        
                    label: (
                        <span style={{ fontSize: 14 }}>
                          Activity
                        </span>
                      ),
                    children: (
                    <div style={{ padding: 28 }}>
                        {/* MESSAGE INPUT */}
                        <Row gutter={16} align="middle" style={{ marginBottom: 32 }}>
                            <Col>
                                <Avatar
                                    size={48}
                                    style={{
                                        background: "#0F218B",
                                        color: "#FFF",
                                        fontWeight: 700,
                                    }}
                                >
                                    {getInitials(selectedTicket?.RequestorName)}
                                </Avatar>
                            </Col>

                            <Col flex="auto">
                                <StyledTextArea placeholder="Type your message here..." autoSize={{ minRows: 2, maxRows: 3 }}
                                    value={mensahe}
                                    onChange={(e) => setMessage(e.target.value)}
                                    style={{
                                        borderRadius: 14,
                                        padding: 14,
                                        fontSize: 12,
                                    }}
                                />
                            </Col>

                            <Col>
                                <Button type="primary" icon={<SendOutlined />} size="large" onClick={handleSubmitMessage}
                                    style={{
                                        height: 52,
                                        paddingInline: 28,
                                        borderRadius: 14,
                                        fontWeight: 600,
                                    }}
                                >
                                    Post
                                </Button>
                            </Col>
                        </Row>
                        
                        {/* TIMELINE */}
                        <div style={{ position: "relative", paddingLeft: 30,  borderLeft: "2px solid #E5E7EB", }}>
                            {messages.map((item: TicketMessage, index: number) => (
                                <div key={index} style={{ position: "relative", marginBottom: 28, margin: 40 }} >
                                    {/* AVATAR */}
                                    <div style={{ position: "absolute", left: -56, top: 0, }}>
                                        <Avatar
                                            size={48}
                                            style={
                                                item.SenderName === selectedTicket.RequestorName
                                                  ? {
                                                      background: "#0F218B",
                                                      color: "#FFF",
                                                      fontWeight: 700,
                                                    }
                                                  : {
                                                      background: "#FFFDD0",
                                                      color: "#8B8000",
                                                      fontWeight: 700,
                                                    }
                                              }
                                        >
                                            {getInitials(item?.SenderName)}
                                        </Avatar>
                                    </div>

                                    <div style={{ background: "#fff", border: "1px solid #F1F5F9", borderRadius: 18, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.04)",}}>
                                        <Row justify="space-between" align="top">
                                        <Col flex="auto">
                                            <Space direction="vertical" size={4}>
                                            <Text strong style={{ fontSize: 14, color: "#172B4D",}}>
                                                {item.SenderName}
                                            </Text>

                                            <Text style={{ fontSize: 12, color: "#000", }}>
                                                {item.Message}
                                            </Text>

                                            <Tag color="blue">{item.Status}</Tag>
                                            </Space>
                                        </Col>

                                        <Col>
                                            <Text type="secondary">
                                            {dayjs(item.DateSent, "YYYY-MM-DD HH:mm:ss.SSS").fromNow()}
                                            </Text>
                                        </Col>
                                        </Row>
                                    </div>
                                </div>
                            ))}
                            {/* START */}
                            <div style={{ display: "flex", alignItems: "center", gap: 16,}}>
                                <Avatar size={48}
                                    style={{ background: "#BBF7D0", color: "#166534", fontWeight: 700, }}
                                >
                                    <FlagOutlined/>
                                </Avatar>

                                <Text strong
                                    style={{
                                        fontSize: 14,
                                        color: "#475569",
                                    }}
                                > Start
                                </Text>
                            </div>
                        </div>
                        
                        
                    </div>

                    ),
                },

                {
                    key: "2",
                    label: (
                        <span style={{ fontSize: 14 }}>
                          Details
                        </span>
                      ),
                    children: (
                    <div style={{ padding: 28 }}>
                        
                            <Row gutter={[16, 16]}>
                            {Object.entries(fields)
                                .filter(([key]) => !EXCLUDED_FIELDS.includes(key))
                                .map(([key, value]) => (
                                    <Col span={12} key={key}>
                                    <Text type="secondary">{formatLabel(key)}</Text>
                                    <div style={{ fontWeight: 500 }}>{renderValue(value, key)}</div>
                                    </Col>
                                ))}
                                                            
                            </Row>
                      
                    </div>
                    ),
                },

              
                ]}
            />

            </Card>
        </div>
        </div>
    </MainLayout>
  )
}

export default TicketDetails