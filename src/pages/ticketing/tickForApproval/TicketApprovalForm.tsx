import React, { useState } from 'react'
import { DrawerProps } from '../../../types/Drawer'
import { Drawer,  Row, Descriptions, List, Space, Button, message, Modal } from 'antd'
import { RightOutlined, CloseOutlined, CheckOutlined } from "@ant-design/icons";
import { TicketProps } from '../../../types/Ticketing_drawer'
import { renderValue, formatLabel } from '../../../utils/valueNormalizer'
import { getDBColumns } from '../../../hooks/configuration/dbColumns_hooks';
import { StyledTextArea } from '../../../components/StyledComponents';
import API from '../../../api/api';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);


const TicketApprovalForm: React.FC<DrawerProps & {record?: TicketProps | null}> = ({isDrawerOpen, closeDrawer, onUserAction, record}) => {

    const { columns = [] } = getDBColumns(record?.InhouseName);
    const columnsSafe = Array.isArray(columns) ? columns : [];
    const [ showModal, setShowModal ] = useState(false);
    const [reason, setReason] = useState("");

    
    const convertDBNames = (module: string) => {
        if (!record?.InhouseName) return null;
      
        return columnsSafe.find(
          (col: any) => col.DBColumn === module
        )?.Description ?? null;
    };


    const fields = record?.custom_fields?.[0]?.CustomFields || {};
    const modules = record?.modules?.map((m: any) => m.ModuleName) || [];
    
    const EXCLUDED_FIELDS = ["EmployeeId", "SystemName", "category"]

    const handleApprove = async() => {
        try{
            if(!record){
                return false;
            }

            //console.log(record)

            const response = await API.post(`/api/approve`, record)
            if (response.status === 200){
                message.success(response.data.message);
                onUserAction();
                closeDrawer();
            }
            else{
                message.error(response.data.message);
            }

        }
        catch(e:any){
            message.error("Error on approving  request ", e);
            console.error("Error on approving  request ", e);
        }
    }


    const handleDecline = async() => {
        try{
            if(!record){
                return false;
            }

            const payload = {
                ...record, 
                reason
            }

            const response = await API.post(`/api/decline`, payload)
            if (response.status === 200){
                message.success(response.data.message);
                onUserAction();
                closeDrawer();
            }
            else{
                message.error(response.data.message);
            }

        }
        catch(e:any){
            message.error("Error on declining  request ", e);
            console.error("Error on declining  request ", e);
        }
    }

    
  return (
    <>
    <Drawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        width={700}
        extra={
            <Space>
              <Button color="danger" variant="outlined" onClick={() => setShowModal(true)}><CloseOutlined/> Decline</Button>
              <Button type="primary" onClick={() => handleApprove()}> <CheckOutlined/> Approve </Button>
            </Space>
          }
        >
            <div style={{ marginTop: 25}} >
                <Row gutter={12}>
                    <p style={{ fontSize: "10px", padding: "0 6px", marginTop: "2px", fontWeight: 600}}> GENERAL DETAILS </p>
                </Row>

                {
                <Descriptions column={1} bordered size="small" className="small-desc">
                    <Descriptions.Item label="Ticket Number">  {record?.TicketNumber} </Descriptions.Item>
                    <Descriptions.Item label="Request Type">  {record?.RequestName} </Descriptions.Item>
                    <Descriptions.Item label="Requestor Name">  {record?.RequestorName} </Descriptions.Item>
                    <Descriptions.Item label="Request For">  {record?.RequestForName} </Descriptions.Item>
                    <Descriptions.Item label="Date Created">  {dayjs(record?.DateCreated).fromNow()} </Descriptions.Item>
                </Descriptions>
                }
            </div>

            <div style={{ marginTop: 25}} >
                <Row gutter={12}>
                    <p style={{ fontSize: "10px", padding: "0 6px", marginTop: "2px", fontWeight: 600}}> REQUEST DETAILS </p>
                </Row>

                {
                <Descriptions column={1} bordered size="small" className="small-desc">
                    {Object.entries(fields)
                    .filter(([key]) => !EXCLUDED_FIELDS.includes(key))
                    .map(([key, value]) => (
                        <Descriptions.Item key={key} label={formatLabel(key)}>{renderValue(value)} </Descriptions.Item>
                    ))}
                </Descriptions>
                }
            </div>

            { modules.length > 0 && (
                <div style={{ marginTop: 25 }}>
                    <Row gutter={12}>
                    <p
                        style={{
                        fontSize: "10px",
                        padding: "0 6px",
                        marginTop: "2px",
                        fontWeight: 600,
                        }}
                    >
                        REQUESTING ACCESS TO INHOUSE MODULES
                    </p>
                    </Row>

                    <List style={{padding: 5, fontSize: 12}}>
                        {modules.map((name: string, index: number) => (
                            <List.Item key={index}> <RightOutlined style={{ fontSize: 12 }} /> {convertDBNames(name)}</List.Item>
                        ))}
                    </List>
                  
                </div>
            )}
            

    </Drawer>

    <Modal
        title="Reason for declining"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={showModal}
        onOk={handleDecline}
        onCancel={() => setShowModal(false)}>
        <StyledTextArea  id='reason' style={{ fontSize: 12 }} rows={5} onChange={(e) => setReason(e.target.value)}></StyledTextArea>
    </Modal> 
    

    </>
  )
}

export default TicketApprovalForm