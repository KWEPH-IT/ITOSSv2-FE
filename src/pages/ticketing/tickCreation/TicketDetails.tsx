import { useMemo, useState, useEffect, memo } from 'react';
import MainLayout from '../../MainLayout'
import TicketAssignmentModal from './TicketAssignmentModal';
import "../../../styles/userTicketDetails.css";
import { Card, Row, Col, Tag, Typography, Divider, Avatar, Tabs, Space, Button, Dropdown, message, Upload, Form, Timeline, Modal, Popconfirm, Descriptions} from 'antd';
import { StyledTable } from '../../../components/StyledTable';
import { StyledInput, StyledTextArea } from '../../../components/StyledComponents';
import { useParams } from 'react-router-dom';
import { useTickets } from '../../../hooks/ticketing/ticketing_hooks';
import { useTicketCategs } from '../../../hooks/configuration/ticketCateg_hooks';
import { TicketCustomFields, TicketCategProps, SelectOption } from '../../../types/TicketsCateg_drawer';
import { Loader } from '../../../components/Loader';
import { getInitials } from '../../../utils/stringFormat';
import { SendOutlined, FlagOutlined, DownOutlined, CloseOutlined, UploadOutlined, CheckCircleFilled, TeamOutlined, CheckOutlined, SwapOutlined, CheckCircleOutlined, GlobalOutlined, DownloadOutlined  } from "@ant-design/icons";
import { renderField } from '../../../utils/fieldRenderer';
import { normalizeValues } from '../../../utils/valueNormalizer';
import { TicketMessage } from '../../../types/Ticketing_drawer';
import { handleLoggedAction } from '../../../utils/Logger';
import { useAuth } from '../../../context/AuthContext';
import { getEmployees } from '../../../hooks/configuration/vwAtKWE_hooks';
import { getFullName } from '../../../utils/getEmployeeDetails';
import API from '../../../api/api';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { MenuProps } from 'antd';
import relativeTime from "dayjs/plugin/relativeTime";
const apiUrl = import.meta.env.VITE_SERVER_API_URL;


dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

const { Title, Text } = Typography

const TicketDetails = () => {
    const { tn } = useParams();
    const decoded_tn = tn ? atob(tn) : "";

    const { userId } = useAuth();
    const { categ, loading : categLoading } = useTicketCategs();
    const [ form ] = Form.useForm();
    const [ enrichedFields, setEnrichedFields ] = useState<TicketCustomFields[]>([]);
    const [ showModal, setShowModal ] = useState(false);
    const [ showSNModal, setSNShowModal ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(false);
    const { employees, loading : empLoading } = getEmployees();

    const filters = useMemo(() => ({
        ticketno: decoded_tn ?? undefined,
    }), [decoded_tn]);
    const [ mensahe, setMessage ] = useState(""); 
    const [fileList, setFileList] = useState<any[]>([]);
    const maxSizeMB = 5;
    const allowedExt = ["jpg", "jpeg", "png", "gif", "pdf", "xls", "xlsx"];

    const { ticket, loading, refetch } = useTickets(filters)
    const selectedTicket = ticket?.[0];
    const messages = [...(ticket?.[0]?.messages || []) as TicketMessage[]].sort(
        (a: TicketMessage, b: TicketMessage) =>
          new Date(b.DateSent).getTime() - new Date(a.DateSent).getTime()
      );
    
    const category = categ?.filter((cat: TicketCategProps) => cat.SystemId === selectedTicket?.RequestType)
    const IsSNConnected = category?.[0]?.IsSNConnected;
    // const parent = category?.[0]?.ParentId;
    const fields = category?.[0]?.custom_fields;
    const fieldsValue = selectedTicket?.custom_fields?.[0]?.CustomFields || {};
    const modules = selectedTicket?.modules || [];

    const approvals = category?.[0]?.approvers || [];
    
    const highestLevel =
    approvals.length > 0
      ? approvals.reduce((max: any, current: any) =>
          current.LevelNo > max.LevelNo ? current : max
        )
      : null;

    const highestApproval = highestLevel?.LevelNo;
      
    useEffect(() => {
        if (!fields) return;
      
        const enrichFields = async () => {     
          const tableCache: Record<string, SelectOption[]> = {};
      
          const enriched = await Promise.all(
            fields.map(async (field : TicketCustomFields) => {
              const fieldType = field.FieldType?.toLowerCase();
      
              if (
                fieldType === "select" &&
                field.SelectSourceType === "table" &&
                field.TableName &&
                field.ValueColumn &&
                field.LabelColumn
              ) {
                const key = `${field.TableName}-${field.ValueColumn}-${field.LabelColumn}`;
      
                if (!tableCache[key]) {
                  const res = await API.post<SelectOption[]>("/api/options", {
                    TableName: field.TableName,
                    ValueColumn: field.ValueColumn,
                    LabelColumn: field.LabelColumn,
                  });
      
                  tableCache[key] = res.data;
                }
      
                return { ...field, options: tableCache[key] };
              }
      
              if (
                fieldType === "select" &&
                field.SelectSourceType === "static" &&
                field.StaticOptions
              )
              {
                return {
                  ...field,
                  options: field.StaticOptions,
                };
              }
      
              return field;
            })
          );
          setEnrichedFields(enriched);
        };
        enrichFields();
    }, [fields]);

    const groupedFields = useMemo(() => {
        const groups: Record<string, TicketCustomFields[]> = {};
    
        enrichedFields.forEach(field => {
            const value =
                field.GroupName && field.IsRepeatable === "1"
                    ? null // repeatable groups are handled by Form.List
                    : fieldsValue?.[field.FieldName] ?? null;
    
            const fieldWithValue = {
                ...field,
                Value: value,
            };
    
            const group = field.GroupName || "___NO_GROUP___";
    
            if (!groups[group]) {
                groups[group] = [];
            }
    
            groups[group].push(fieldWithValue);
        });
    
        return groups;
    }, [enrichedFields, fieldsValue]);
    
    
    useEffect(() => {
        if (!fields?.length || !fieldsValue) return;
    
        const formValues = { ...fieldsValue };
    
        fields.forEach((field: any) => {
            const fieldName = field.FieldName;
            const groupName = field.GroupName;
    
            const isGrouped =
                groupName && groupName !== "___NO_GROUP___";
    
            const getValue = () => {
                if (isGrouped) {
                    const groupedValue = formValues[groupName]?.[fieldName];
            
                    if (groupedValue !== undefined) {
                        return groupedValue;
                    }
            
                    return formValues[fieldName];
                }
            
                return formValues[fieldName];
            };
            
            const setValue = (value: any) => {
                if (isGrouped) {
                    formValues[groupName] = {
                        ...formValues[groupName],
                        [fieldName]: value,
                    };
                } else {
                    formValues[fieldName] = value;
                }
            };

            const value = getValue();

            // DATE
            if (field.FieldType === "Date" && value) {
                setValue(dayjs(value));
            }
    
            // GROUP NAME
            if (fieldName === "GroupName" && value) {
                setValue(
                    value.replace(
                        "KWEPH - Group Email - ",
                        ""
                    )
                );
            }
    
            // GROUP EMAIL
            if (fieldName === "GroupEmailAddress" && value) {
                setValue(
                    value.replace(
                        ".kweph@kwe.com",
                        ""
                    )
                );
            }
    
            // FILE UPLOADER
            if (
                field.FieldType === "File Uploader" &&
                Array.isArray(value)
            ) {
                
    
                const mappedFiles = value.map(
                    (file: any, index: number) => ({
                        uid: file.uid || `-${index}`,
                        name: file.filename || file.stored_filename,
                        status: "done",
                        
    
                        url: file.path
                            ? `${apiUrl}/api/${file.path.replace(/\\/g, "/")}`
                            : file.url,

                            
                    })
                );
               
                setValue(mappedFiles);
            }
        });
    
        form.setFieldsValue(formValues);
    }, [fields, fieldsValue, form]);

    
    
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
        else if(key === "3"){
            handleLoggedAction(
                userId!,
                "TICKET DETAILS",
                "Clicked ticket approval flow."
            );
        }
      };

    const items: MenuProps['items'] = [
        ...(
            highestApproval == null || selectedTicket?.CurrentLevel >= highestApproval
              ? [
                  {
                    label: "Assign Ticket",
                    key: "3",
                    icon: <TeamOutlined />,
                  },
                ]
              : [
                  {
                    label: "Re-send Ticket",
                    key: "1",
                    icon: <TeamOutlined />,
                  },
                  {
                    label: (
                        <Popconfirm
                          title="Cancel this request?"
                          description="This action cannot be undone."
                          okText="Yes, cancel it"
                          cancelText="No"
                          onConfirm={() => handleCancelRequest()}
                          onCancel={(e) => e?.stopPropagation()}
                        >
                          <span onClick={(e) => e.stopPropagation()}>
                            Cancel Request
                          </span>
                        </Popconfirm>
                      ),
                    key: "2",
                    icon: <CloseOutlined />,
                  },
                ]
          ),
        
        
        ...((selectedTicket?.CurrentLevel >= highestApproval?.LevelNo )
            ?   [
                    {
                        label: 'Assign Ticket',
                        key: '3',
                        icon: <TeamOutlined />
                    }
                ]
            : []),
    ];
        
    

    const handleRemoveFile = (uid: string) => {
        setFileList((prev) => prev.filter((file) => file.uid !== uid));
    };

    const uploadProps = {
        beforeUpload: (file: File) => {
          const ext = file.name.split(".").pop()?.toLowerCase();
      
          const isAllowedExt = allowedExt.includes(ext || "");
      
          const allowedMimeTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "application/pdf",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ];
      
          const isAllowedMime = allowedMimeTypes.includes(file.type);
      
          const isAllowed = isAllowedExt || isAllowedMime;
      
          if (!isAllowed) {
            message.error(
              "Only JPG, PNG, GIF, PDF, XLS, XLSX files are allowed."
            );
            return Upload.LIST_IGNORE;
          }
      
          const isUnder5MB = file.size / 1024 / 1024 <= maxSizeMB;
      
          if (!isUnder5MB) {
            message.error("File must be smaller than 5MB.");
            return Upload.LIST_IGNORE;
          }
      
          // Add to state manually
          setFileList((prev) => [...prev, file]);
      
          return false; // prevent auto upload
        },
      
        fileList,
      
        onRemove: (file: any) => {
          setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
        },
    };

    const handleCancelRequest = async () => {
        try {
          handleLoggedAction(userId!, 'TICKET CANCELLATION', "Clicked Cancel Request button");
          const response = await API.post(`/api/cancel`, {
            ticket_no: decoded_tn,
          });
          message.success(response.data.message);
      
          await refetch();
        } catch (e: any) {
          console.error(e);
          message.error(e.response?.data?.message || "Failed to send message");
        }
    };


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

        else if(info.key === "3"){
            handleLoggedAction(userId!, 'TICKET ASSIGNMENT', "Clicked Assign ticket button")
            setShowModal(true);
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
            handleLoggedAction(userId!, 'SENT MESSAGE', "Sent message!")

            const formData = new FormData();
            formData.append("ticketno", decoded_tn);
            formData.append("message", mensahe);
        
            fileList.forEach((file) => {
                formData.append("files", file);
            });

            const response = await API.post(`/api/message`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
            message.success(response.data.message);

            setMessage("")
            setFileList([]);
            await refetch();
        }
        catch(e: any){
            console.error(e);
            message.error(
                e.response?.data?.message || "Failed to send message"
            );
        }
    }       

    const handleConfirm = async() => {
        try{
            setIsLoading(true);
            
            const response = await API.post(`/api/confirmassign`, {
                ticket_no: decoded_tn
            })

            message.success(response.data.message)
            handleLoggedAction(userId!, 'TICKET ASSIGNMENT', "Confirmed ticket Assignment " + decoded_tn )

            await refetch()
            
        }
        catch(e: any){
            console.error(e);
            message.error( e.response?.data?.message || "Failed to confirmed ticket")
        }
        finally{
            setIsLoading(false);
        }
    }

    const handleInhouseProcess = async() => {
        try{
            setIsLoading(true);

            const response = await API.post(`/api/process`, {
                ticket_no: decoded_tn,
                employeeId: selectedTicket.RequestFor,
                inhouse: selectedTicket.InhouseName,
                modules,
                fieldsValue
            })

            message.success(response.data.message)
            handleLoggedAction(userId!, 'TICKET ASSIGNMENT', "Procesed inhouse system access request " + decoded_tn )

            await refetch()
        }
        catch(e: any){
            console.error(e);
            message.error( e.response?.data?.message || "Failed to process request")
        }
        finally{
            setIsLoading(false)
        }
    }

    const handleServiceNow = async() => {
        setSNShowModal(true);
    }

    
    const handleClosing = async() => {
        try{
            setIsLoading(true)
            const response = await API.post(`/api/ticket/close`, {
                ticketno : decoded_tn
            })
            
            message.success(response.data.message)
            if(selectedTicket.Status === "For Closing")
                handleLoggedAction(userId!, 'TICKET DETAILS', "Closed ticket " + decoded_tn )
            else
                handleLoggedAction(userId!, 'TICKET DETAILS', "Marked as resolved " + decoded_tn )
            await refetch()
        }
        catch(e:any){
            message.error(e.message)
        }
        finally{
            setIsLoading(false)
        }
    }


    const onFinish = async (values: any) => {
        try {
            setIsLoading(true);
    
            const cleanedCustomFields = normalizeValues({ ...values });
    
            // ==========================================
            // REMOVE FILE UPLOADERS FROM CUSTOM FIELDS
            // ==========================================
            fields.forEach((field: TicketCustomFields) => {
                if (field.FieldType !== "File Uploader") {
                    return;
                }
    
                const fieldName = field.FieldName;
                const groupName = field.GroupName;
    
                const isGrouped =
                    groupName && groupName !== "___NO_GROUP___";
    
                if (isGrouped) {
                    if (cleanedCustomFields[groupName]) {
                        delete cleanedCustomFields[groupName][fieldName];
                    }
                } else {
                    delete cleanedCustomFields[fieldName];
                }
            });
    
            // ==========================================
            // FIX DATE FIELDS BEFORE STRINGIFY
            // ==========================================
            Object.keys(cleanedCustomFields).forEach((key) => {
                const value = cleanedCustomFields[key];
    
                if (
                    typeof value === "string" &&
                    value.includes("T") &&
                    !isNaN(Date.parse(value))
                ) {
                    cleanedCustomFields[key] = new Date(value)
                        .toISOString()
                        .split("T")[0];
                }
            });
    
            // ==========================================
            // FORM DATA
            // ==========================================
            const formData = new FormData();
    
            formData.append("ticket_no", decoded_tn);
    
            formData.append(
                "custom_fields",
                JSON.stringify(cleanedCustomFields)
            );
    
            // ==========================================
            // APPEND FILES
            // ==========================================
            fields.forEach((field: TicketCustomFields) => {
                if (field.FieldType !== "File Uploader") {
                    return;
                }
    
                const fieldName = field.FieldName;
                const groupName = field.GroupName;
    
                const isGrouped =
                    groupName && groupName !== "___NO_GROUP___";
    
                // Get the correct value
                const files = isGrouped
                    ? values[groupName]?.[fieldName]
                    : values[fieldName];
    
                if (!Array.isArray(files) || !files.length) {
                    return;
                }
    
                files.forEach((file: any) => {
    
                    // Only append NEW files
                    // Existing files already have a URL/path and
                    // don't have originFileObj.
                    if (file.originFileObj) {
                        console.log("Appending file:", {
                            fieldName,
                            groupName,
                            name: file.name,
                        });
    
                        formData.append(
                            fieldName,
                            file.originFileObj
                        );
                    }
                });
            });
    
            // ==========================================
            // DEBUG
            // ==========================================
            console.log("=== FormData ===");
    
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(key, {
                        name: value.name,
                        size: value.size,
                        type: value.type,
                    });
                } else {
                    console.log(key, value);
                }
            }
    
            // ==========================================
            // UPDATE
            // ==========================================
            const response = await API.put(
                `/api/ticket`,
                formData
            );
    
            handleLoggedAction(
                userId!,
                "TICKET DETAILS",
                "Modified ticket details."
            );
    
            message.success(response.data.message);
    
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    if (loading || isLoading || empLoading || categLoading) {
  return <Loader />;
}
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
                            { selectedTicket.Status != 'Assigned' && selectedTicket.Status != 'For Closing' && selectedTicket.Status != 'Closed' && selectedTicket.Status != 'Cancelled Request' ? (
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
                                ) : null 
                            }
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

                    <Col flex="auto" />
                    { (selectedTicket.AssignedTo === userId && selectedTicket.Status === "Assigned") || (selectedTicket.RequestType === 17 && selectedTicket.Status === "Approved By IT Manager" && userId === 'K656') ?  (
                        <Col>
                            <Space>
                                <Button type="primary" onClick={handleConfirm} style={{
                                        height: 42,
                                        padding: "0 22px",
                                        borderRadius: 10,
                                        fontWeight: 600,
                                        boxShadow: "0 4px 12px rgba(22,119,255,.25)",
                                    }}
                                    icon={<CheckOutlined />}>
                                    Confirm
                                </Button>
                                <Button variant='outlined' onClick={()=>setShowModal(true)} danger style={{
                                        height: 42,
                                        padding: "0 22px",
                                        borderRadius: 10,
                                        fontWeight: 600,
                                    }}
                                    icon={<SwapOutlined />}>
                                    Re-assign
                                </Button>
                            </Space>
                        </Col>
                    ): selectedTicket.Status === "On Process" && selectedTicket.AssignedTo === userId && IsSNConnected === 1 ? (
                        <Col>
                            <Space>
                                <Button type="primary" onClick={handleServiceNow}  style={{
                                        height: 42,
                                        padding: "0 22px",
                                        borderRadius: 10,
                                        fontWeight: 600,
                                        boxShadow: "0 4px 12px rgba(22,119,255,.25)",
                                    }}
                                    icon={<GlobalOutlined />}>
                                    ServiceNow
                                </Button>
                                
                                <Button variant='solid' color='green' onClick={handleClosing} style={{
                                        height: 42,
                                        padding: "0 22px",
                                        borderRadius: 10,
                                        fontWeight: 600,
                                        boxShadow: "0 4px 12px rgba(22,119,255,.25)",
                                    }}
                                    icon={<CheckCircleOutlined />}>
                                    Mark as Resolved
                                </Button>
                            </Space>
                        </Col>
                    ): selectedTicket.Status === "For Closing" && selectedTicket.RequestorId === userId ? (
                        <Col>
                            <Button
                                color="green"
                                variant="solid"
                                onClick={handleClosing}
                                icon={<CheckCircleOutlined />}
                                style={{
                                    height: 42,
                                    padding: "0 22px",
                                    borderRadius: 10,
                                    fontWeight: 600,
                                }}
                            >
                                Close Ticket
                            </Button>
                        </Col>
                    ) : null }
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

                        { ((selectedTicket.Status == 'On Process' || selectedTicket.Status == 'For Closing') && (selectedTicket.RequestFor === userId || selectedTicket.AssignedTo === userId)) ? (
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
                                    <div
                                        style={{
                                        border: "1px solid #d9d9d9",
                                        borderRadius: 14,
                                        padding: 10,
                                        }}
                                    >
                                        {/* Attached file preview */}
                                        {fileList.length > 0 && (
                                        <div style={{ marginBottom: 8 }}>
                                            {fileList.map((file) => (
                                            <div
                                                key={file.uid}
                                                style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                background: "#f0f0f0",
                                                padding: "4px 10px",
                                                borderRadius: 10,
                                                marginRight: 6,
                                                fontSize: 12,
                                                }}
                                            >
                                                📎 {file.name}

                                                <span
                                                    onClick={() => handleRemoveFile(file.uid)}
                                                    style={{
                                                        marginLeft: 8,
                                                        cursor: "pointer",
                                                        fontWeight: "bold",
                                                    }}
                                                    >
                                                    ×
                                                </span>
                                            </div>
                                            ))}
                                        </div>
                                        )}

                                        {/* Text area */}
                                        <StyledTextArea
                                        placeholder="Type your message here..."
                                        autoSize={{ minRows: 2, maxRows: 3 }}
                                        value={mensahe}
                                        onChange={(e) => setMessage(e.target.value)}
                                        bordered={false}
                                        style={{
                                            padding: 0,
                                            fontSize: 12,
                                        }}
                                        />
                                    </div>
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
                                <Col>
                                    <Upload {...uploadProps} showUploadList={false}>
                                        <Button
                                        icon={<UploadOutlined />}
                                        size="large"
                                        style={{
                                            height: 52,
                                            paddingInline: 28,
                                            borderRadius: 14,
                                            fontWeight: 600,
                                        }}
                                        />
                                    </Upload>
                                </Col>
                            </Row>
                            ) : null
                        }

                        
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
                                                {item.Files?.map((file: any) => {

                                                    const ext = file.FileName.split(".").pop().toLowerCase();

                                                    const isImage = ["jpg","jpeg","png","gif"].includes(ext);

                                                    return (
                                                        <div
                                                            key={file.FileName}
                                                            onClick={() =>
                                                                window.open(
                                                                    `${apiUrl}/api${file.FilePath}`,  //to change for production
                                                                    "_blank"
                                                                )
                                                            }
                                                            style={{
                                                                cursor: "pointer",
                                                                marginTop: 10
                                                            }}
                                                        >

                                                            {isImage ? (
                                                                <img
                                                                    src={`${apiUrl}/api${file.FilePath}`}
                                                                    width={120}
                                                                    height={80}
                                                                    style={{
                                                                        objectFit: "cover",
                                                                        borderRadius: 10
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Tag color="blue">
                                                                    📎 {file.FileName}
                                                                </Tag>
                                                            )}

                                                        </div>
                                                    );
                                                })}
                                                
                                                {item.Status &&
                                                    item.Status !== "NULL" && (
                                                        <Tag color="blue">{item.Status}</Tag>
                                                    )}
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
                        <Form form={form} layout='vertical' onFinish={onFinish}>

                            {Object.entries(groupedFields).map(([groupName, fields]) => {
                            
                                // ✅ CASE 1: NORMAL FIELDS (no group)
                                if (groupName === "___NO_GROUP___") {
                                    return fields.map(field => (
                                    <Form.Item
                                        key={`${groupName}-${field.FieldName}`}
                                        name={field.FieldName}
                                        label={field.FieldLabel}
                                        rules={[{ required: field.FieldType !== "File Uploader" }]}
                                        {...(
                                          field.FieldType === "File Uploader"
                                            ? {
                                                valuePropName: "fileList",
                                                getValueFromEvent: (e: any) => e?.fileList,
                                              }
                                            : {}
                                        )}
                                        
                                    >
                                        {renderField(field)}
                                    </Form.Item>
                                    ));
                                }

                                // ✅ CASE 2: GROUPED FIELDS
                                const isRepeatable = fields[0].IsRepeatable === "1";

                                if (!isRepeatable) {
                                    return (
                                    <Card key={groupName} title={groupName} style={{ marginBottom: 16 }}>
                                        {fields.map(field => (
                                        <Form.Item
                                            key={`${groupName}-${field.FieldName}`}
                                            name={[groupName, field.FieldName]}
                                            label={field.FieldLabel}
                                            rules={[{ required: field.FieldType !== "File Uploader" }]}
                                            {...(
                                              field.FieldType === "File Uploader"
                                                ? {
                                                    valuePropName: "fileList",
                                                    getValueFromEvent: (e: any) => e?.fileList,
                                                  }
                                                : {}
                                            )}
                                        >
                                            {renderField(field)}
                                        </Form.Item>
                                        ))}
                                    </Card>
                                    );
                                }

                                // 🔥 CASE 3: REPEATABLE GROUP
                                return (
                                    <Form.List key={groupName} name={groupName}>
                                    {(groupItems, { add, remove }) => (
                                        <>
                                        {groupItems.map(item => (
                                            <Card key={item.key} style={{ marginBottom: 16 }}>
                                            
                                            {fields.map(field => (
                                                <Form.Item
                                                key={field.FieldName}
                                                name={[item.name, field.FieldName]}
                                                label={field.FieldLabel}
                                                rules={[{ required: true }]}
                                                >
                                                {renderField(field)}
                                                </Form.Item>
                                            ))}

                                            <Button danger onClick={() => remove(item.name)}>
                                                Remove
                                            </Button>
                                            </Card>
                                        ))}

                                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                                            <Button type="dashed" onClick={() => add()}>
                                            + Add {groupName}
                                            </Button>
                                        </div>
                                        </>
                                    )}
                                    </Form.List>
                                );
                            })}

                            {
                                modules?.length > 0 ? (
                                    <StyledTable
                                        data={modules}
                                        rowKey="ModuleName"
                                        pagination={false}
                                        columns={[
                                            {
                                                title: "Module",
                                                dataIndex: "ModuleLabel",
                                                key: "ModuleName"
                                            },
                                            {
                                                title: "Access",
                                                render: () => (
                                                    <Tag color="orange">
                                                    Requested
                                                    </Tag>
                                                )
                                            },
                                        ]}
                                        />
                
                                ) :
                                null
                            }
                            {(selectedTicket.Status === 'On Process' && selectedTicket.AssignedTo === userId) ? 
                                (
                                    <Button type="primary" block htmlType='submit'>
                                        Save Changes
                                    </Button>
                                ): null
                            }

                            {(selectedTicket.InhouseName && selectedTicket.Status === 'On Process' && selectedTicket.AssignedTo === userId) ? 
                                (
                                    <Button variant="outlined" onClick={handleInhouseProcess} color='orange' block style={{ marginTop: 10 }}>
                                        Process Request
                                    </Button>
                                ): null
                            }
                        </Form>
                      
                    </div>
                    ),
                },

                {
                    key: "3",
                    label: (
                        <span style={{ fontSize: 14 }}>
                          Approval Flow
                        </span>
                      ),
                      children: (
                        <div style={{ padding: 28 }}>
                            <Timeline
                                items={approvals.map((step:any, index:any) => ({
                                dot: <CheckCircleFilled className="timeline-dot" />,
                                children: (
                                    <div className="timeline-item" style={{ letterSpacing: 0.7 }}>
                                    <div className="timeline-title">
                                    {
                                        step.ApproverType === "Dynamic Superior" ? (
                                        <>
                                            {getFullName(selectedTicket?.ISId, employees)}{" "}
                                            <Tag color="orange">{step.Description}</Tag>
                                        </>
                                        ) : step.ApproverType === "Dynamic Manager" ? (
                                        <>
                                            {getFullName(selectedTicket?.DHId, employees)}{" "}
                                            <Tag color="blue">{step.Description}</Tag>
                                        </>
                                        ) : step.ApproverType === "Specific User" ? (
                                        <>
                                            {getFullName(step.ApproverValue, employees)}{" "}
                                            <Tag color="green">{step.Description}</Tag>
                                        </>
                                        
                                        ) : (
                                        ""
                                        )
                                    }
                                    </div>
                                    <div className="timeline-sub">
                                        <Space>
                                        Step {index + 1} 
                                        {
                                        step.ApproverType === "Dynamic Superior" ? (
                                            <span style={{  color: "#000" }}>Immediate Superior</span>
                                        ) : step.ApproverType === "Dynamic Manager" ? (
                                            <span style={{  color: "#000" }}>Department Head</span>
                                        ) : step.ApproverType === "Role" ? (
                                            <span style={{ color: "#000" }}>{step.Description}</span>
                                        ) : (
                                            ""
                                        )
                                        }
                                        </Space>
                                    </div>
                                    </div>
                                ),
                                }))}
                            />
                        </div>


                    )

                }

                ]}
            />

            </Card>
        </div>
        </div>
        
        <TicketAssignmentModal isModalOpen={showModal} closeDrawer={()=> setShowModal(false)}  record={category} ticket_no={decoded_tn} refetch={refetch} />
        <ServiceNowModalHelper showSNModal={showSNModal} userId={userId} record={selectedTicket} onUserAction={refetch} onClose={() => setSNShowModal(false)} />
        
    </MainLayout>
  )
}



const ServiceNowModalHelper = memo(({showSNModal, userId, record, onUserAction, onClose}:any) => {
    const [form] = Form.useForm();
    const [ loading, setIsLoading ] = useState(false);
    // live clock so displayed date/time stays accurate while modal is open
    const [now, setNow] = useState(dayjs());
    const ticket_no = record?.TicketNumber
    const requestType = record?.RequestType

    useEffect(() => {
        const interval = setInterval(() => setNow(dayjs()), 1000);
        return () => clearInterval(interval);
    }, []);

    const handleGenerate = async() =>{
        try{
            setIsLoading(true)
            const response = await API.post(
                `/api/${ticket_no}/generateFile`,
                {},
                { responseType: "blob" }
            );
        
            const url = window.URL.createObjectURL(response.data);
        
            const link = document.createElement("a");
            link.href = url;
            link.download = `${ticket_no}.xlsx`;
            link.click();
        
            URL.revokeObjectURL(url);
            handleLoggedAction(userId!, 'TICKET DETAILS', "Generated Excel file" )
        }
        catch (error: any) {
            message.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSave = async () => {
        try {
          const values = await form.validateFields();
          setIsLoading(true);

          await API.post(`/api/ticket/serviceNow`, {
            ticket_no: ticket_no,
            requestType: requestType,
            SNIncidentNumber: values.SNIncidentNumber,
            SNDateStarted: values.SNDateStarted ? values.SNDateStarted : now.format('YYYY-MM-DD HH:mm:ss'),
            SNDateFinished: record?.SNDateStarted ? now.format('YYYY-MM-DD HH:mm:ss'): null
          });
      
          message.success('ServiceNow details saved');
          onClose();
        } catch (error: any) {
            if (error?.errorFields) return; // validation error, already shown on fields
            message.error(error.message);
            } 
        finally {
          setIsLoading(false);
          onUserAction();
        }
      };

    return (
      <Modal
        title="Service Now details"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={showSNModal}
        onCancel={onClose}
        onOk={handleSave}
        destroyOnHidden
        >
            <Form layout='vertical' form={form} initialValues={{ SNIncidentNumber: record?.SNIncidentNumber }}>
                <Row gutter={10}>
                    <Col span={24}>
                        <Form.Item 
                            name="SNIncidentNumber"
                            label="Service Now Incident Number"
                            rules={[{ required: true }]}
                            >
                            <StyledInput placeholder='Please enter the Incident Number'/>
                        </Form.Item>
                    </Col>
            
                
                    <Col span={24} >
                        {record?.SNDateStarted ?
                            <Descriptions column={1} bordered size="small" className="small-desc">
                                <Descriptions.Item label="Date Started"> <Tag color='orange'>{dayjs(record.SNDateStarted).format('YYYY-MM-DD HH:mm:ss')}</Tag> </Descriptions.Item>
                                {record?.SNDateFinished ?
                                    <Descriptions.Item label="Date Finished"> <Tag color='blue'>{dayjs(record.SNDateFinished).format('YYYY-MM-DD HH:mm:ss')}</Tag> </Descriptions.Item>
                                    : null
                                }
                                <Descriptions.Item label="Status">{record.SNStatus} {record.SNStatus === 'Closed' ? <Button onClick={handleSave} type='link' style={{fontSize: 12, letterSpacing: 0.7, textDecoration: 'underline'}}> Re-open </Button> : null}</Descriptions.Item>
                            </Descriptions>
                            :
                            <Form.Item 
                                name="SNDateStarted"
                                label="Date Started"
                                >
                                <div style={{ padding: '4px 11px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 12, letterSpacing: 0.7 }}>
                                    {now.format('YYYY-MM-DD HH:mm:ss')}
                                </div>
                            </Form.Item>
                        }
                    </Col>

                    <Col span={24} style={{ marginTop: 15 }}>
                        <Form.Item>
                            <Button type="primary" onClick={handleGenerate}  disabled={loading} block icon={<DownloadOutlined />}>
                                {loading? 'Generating ...' : 'Generate Form' }
                            </Button>
                        </Form.Item>
                    </Col>
                    
                    {record?.SNStatus === "Processing" ? (
                        <Col span={24}>
                            <Form.Item 
                                name="SNDateFinished"
                                label="Date Finished"
                                >
                                <div style={{ padding: '4px 11px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 12, letterSpacing: 0.7 }}>
                                    {now.format('YYYY-MM-DD HH:mm:ss')}
                                </div>
                            </Form.Item>
                        </Col>
                    )
                    : null}
                </Row>



            </Form>

      </Modal>
    );
  });

export default TicketDetails
