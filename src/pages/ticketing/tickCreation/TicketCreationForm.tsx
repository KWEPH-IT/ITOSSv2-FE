import { useState, useEffect, useMemo  } from 'react'
import MainLayout from '../../MainLayout'
import { Layout, Row, Col, Card, Button, Space, Form, message, Timeline, Tag } from "antd";
import { StyledSelect } from '../../../components/StyledComponents';
import { StyledTable } from '../../../components/StyledTable';
import { ArrowLeftOutlined, CheckCircleFilled } from "@ant-design/icons";
import "../../../styles/userCreateTicket.css"
import { vwAtKWEProps } from '../../../types/vwAtKWE_drawer';
import { getEmployees } from '../../../hooks/configuration/vwAtKWE_hooks';
import { useAuth } from '../../../context/AuthContext';
import { getUserData } from '../../../hooks/user_hooks';
import { useTicketCategs } from '../../../hooks/configuration/ticketCateg_hooks';
import { TicketCategProps, TicketCustomFields, SelectOption } from "../../../types/TicketsCateg_drawer"
import { ModuleProps } from '../../../types/Ticketing_drawer';
import { renderField } from '../../../utils/fieldRenderer';
import { Loader } from '../../../components/Loader';
import API from '../../../api/api'
import { getFullName } from '../../../utils/getEmployeeDetails';
import { formatName } from '../../../utils/stringFormat';
import { normalizeValues } from '../../../utils/valueNormalizer';
import dayjs from "dayjs";
import { Link } from 'react-router-dom';
import { handleLoggedAction } from '../../../utils/Logger';
import { useNavigate } from 'react-router-dom';


const { Content } = Layout;

const TicketCreationForm = () => {
  const { employees } = getEmployees() ;
  const { userId } = useAuth();
  const { userData } = getUserData(userId);
  const { categ: allCategories } = useTicketCategs();
  const [ levels, setLevels ] = useState<TicketCategProps[][]>([]);
  const [ selectedValues, setSelectedValues ] = useState<number[]>([]);
  const [ approvals, setApprovals ] = useState<any[]>([]); 
  const [rawFields, setRawFields] = useState<TicketCustomFields[]>([]);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [ approverNames, setApproverNames ] = useState({ ISName: "", ISId: "", DHName: "", DHId: ""});
  const [ empDetails, setEmpDetails ] = useState({ EmployeeId: "", FullName: "", FirstName: "", LastName: "", EmailAddress: ""});
  const [ form ] = Form.useForm()
  const [ loading, setIsLoading ] = useState(false);
  const today = dayjs().format("MMMM D, YYYY");
  const [ isSubmit, setIsSubmit ] = useState(false);
  const [ selectedSystem, setSelectedSystem ] = useState("");
  const [ modules, setModules ] = useState([]);
  const [selectedModules, setSelectedModules] = useState<{ module: string; label: string }[]>([]);
  const navigate = useNavigate();
  const employeeId = userData?.EmployeeId;

  useEffect(() => {
    const root = allCategories?.filter((cat: TicketCategProps) => cat.ParentId === null);
    setLevels([root]);
  }, [allCategories]);

  const groupName = Form.useWatch("GroupName", form);

  useEffect(() => {
    const groupEmail = (groupName || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  
    form.setFieldsValue({
      GroupEmailAddress: groupEmail,
    });
  }, [groupName]);


    const filtered = (employees ?? []).filter((i : vwAtKWEProps) =>
      i &&
      (
        i.SuperiorId === employeeId ||
        i.DeptHeadId === employeeId ||
        i.EmployeeId === employeeId
      )
    );

    const finalEmp = filtered.length > 0
    ? filtered
    : userData
      ? [{
          EmployeeId: employeeId,
          EmployeeName: employeeId
        }]
      : [];

      const handleChange = (value: unknown, levelIndex: number) => {
        const selectedValue = value as number;
      
        const updatedSelected = [...selectedValues];
        updatedSelected[levelIndex] = selectedValue;
        updatedSelected.splice(levelIndex + 1);
      
        const children = allCategories.filter(
          (cat: TicketCategProps) => cat.ParentId === selectedValue
        );
      
        const newLevels = levels.slice(0, levelIndex + 1);
      
        if (children.length > 0) {
          newLevels.push(children);
      
          setRawFields([]);
          setCustomFields([]);
          setApprovals([]);
          setSelectedSystem("");
        } else {
          const selectedCategory = allCategories.find(
            (cat: TicketCategProps) => cat.SystemId === selectedValue
          );
      
          setRawFields(selectedCategory?.custom_fields || []);
          setApprovals(selectedCategory?.approvers || []);
          setSelectedSystem(selectedCategory?.Inhouse || "");
        }
      
        setSelectedValues(updatedSelected);
        setLevels(newLevels);
      };

      useEffect(() => {
        if (!selectedSystem) {
          setModules([]);
          return;
        }
      
        let cancelled = false;
      
        const loadModules = async () => {
          try {
            const res = await API.get(
              `/api/systems/${selectedSystem}/modules`,
              {
                params: {
                  userId: empDetails.EmployeeId,
                  email: empDetails.EmailAddress,
                },
              }
            );
      
            if (!cancelled) {
              setModules(res.data.modules);
            }
          } catch (err) {
            console.error(err);
      
            if (!cancelled) {
              setModules([]);
            }
          }
        };
      
        loadModules();
      
        return () => {
          cancelled = true;
        };
      }, [selectedSystem, empDetails.EmployeeId, empDetails.EmailAddress]);


    useEffect(() => {
      const updates: Record<string, any> = {};

        customFields.forEach(field => {
          const mode = field.ValueMode?.toLowerCase();

          if (!mode) return;

          // ✅ GENERATED (example: email pattern)
          if (mode === "generated") {
            const first = empDetails.FirstName?.trim() || "";
            const last = empDetails.LastName?.trim() || "";
            
            
            if (first && last) {
              
              updates[field.FieldName] = `${first}.${last}@kwe.com`
                .toLowerCase()
                .replace(/\s+/g, "");
            }
          }

          // ✅ ACTUAL (from DB / selected employee)
          else if (mode === "actual") {
            // map field to employee property
            const map: Record<string, keyof typeof empDetails> = {
              EmailAddress: "EmailAddress",
              FirstName: "FirstName",
              LastName: "LastName",
              FullName: "FullName"
            };

            const key = map[field.FieldName];

            if (key) {
              updates[field.FieldName] = empDetails[key] || "";
            }
          }
        });

        if (Object.keys(updates).length > 0) {
          form.setFieldsValue(updates);
        }
      }
    , [empDetails, customFields]);

    const onFinish = async (values: any) => {
      try {
        const selectedCategory =
        selectedValues[selectedValues.length - 1];

        if (!selectedCategory) {
          message.warning("Please select a category.");
          return;
        }


        if (modules.length > 0 && !selectedModules.length) {
          message.warning("Please select at least one module");
          return;
        }
    
        setIsLoading(true);
    
        const cleanedCustomFields = normalizeValues({ ...values });

        if (cleanedCustomFields.GroupName) {
          cleanedCustomFields.GroupName =
            `KWEPH - Group Email - ${cleanedCustomFields.GroupName}`;
        }

        if (cleanedCustomFields.GroupEmailAddress) {
          cleanedCustomFields.GroupEmailAddress =
            `${cleanedCustomFields.GroupName}.kweph@kwe.com`;
        }

        customFields.forEach((field) => {
          if (field.FieldType === "File Uploader") {
            delete cleanedCustomFields[field.FieldName];
          }
        });

        // FIX DATE FIELDS BEFORE STRINGIFY
        Object.keys(cleanedCustomFields).forEach((key) => {
          const value = cleanedCustomFields[key];

          if (typeof value === "string" && value.includes("T") && !isNaN(Date.parse(value))) {
            cleanedCustomFields[key] = new Date(value)
              .toISOString()
              .split("T")[0]; // YYYY-MM-DD
          }
        });
    
        const formData = new FormData();
    
        formData.append("RequestFor", values.EmployeeId);
        formData.append("Category", String(selectedCategory));
        formData.append("DHId", approverNames.DHId);
        formData.append("ISId", approverNames.ISId);
        formData.append("emailaddress", empDetails.EmailAddress);
        formData.append("system_name", selectedSystem);
    
        formData.append(
          "custom_fields",
          JSON.stringify(cleanedCustomFields)
        );
    
        formData.append(
          "modules",
          JSON.stringify(selectedModules)
        );
    
        // ACTUAL FILE APPENDING
        customFields.forEach((field) => {
          if (field.FieldType === "File Uploader") {
            const files = values[field.FieldName];
        
            if (files?.length) {
              files.forEach((file: any) => {
                console.log("Appending file:", file.name);
        
                formData.append(
                  field.FieldName,
                  file.originFileObj
                );
              });
            }
          }
        });

        // console.log("=== FormData ===");

        // for (const [key, value] of formData.entries()) {
        //   if (value instanceof File) {
        //     console.log(key, {
        //       name: value.name,
        //       size: value.size,
        //       type: value.type,
        //     });
        //   } else {
        //     console.log(key, value);
        //   }
        // }

        const response = await API.post(
          `/api/ticket`,
          formData
        );
    
        handleLoggedAction(userId!, 'CREATED TICKET', 'Submitted new ticket.')
        message.success(response.data.message);
    
        setIsSubmit(true);
        navigate(`/ticketDetails/${btoa(response.data.ticket_no)}`) 
    
      } catch (error: any) {
    
        message.error(error.message);
    
      } finally {
    
        setIsLoading(false);
    
      }
    };

    useEffect(() => {
      const grantedModules = modules
        .filter((m : ModuleProps) => m.hasAccess)
        .map((m : ModuleProps) => ({
          module: m.module,
          label: m.label,
        }));
    
      setSelectedModules(grantedModules);
    }, [modules]);

  
    const rowSelection = {
      selectedRowKeys: selectedModules.map((m) => m.module), 
      onChange: (_keys: React.Key[], rows: ModuleProps[]) => {
        setSelectedModules(rows.map((r) => ({ module: r.module, label: r.label })));
      },
    };

    useEffect(() => {
      if (!rawFields.length) return;
    
      const enrichFields = async () => {
        setIsLoading(true);
    
        const tableCache: Record<string, SelectOption[]> = {};
    
        const enriched = await Promise.all(
          rawFields.map(async (field) => {
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
    
        setCustomFields(enriched);
        setIsLoading(false);
      };
    
      enrichFields();
    }, [rawFields]);
  


  const groupedFields = useMemo(() => {
    const groups: Record<string, TicketCustomFields[]> = {};
  
    customFields.forEach(field => {
      const group = field.GroupName || "___NO_GROUP___";
  
      if (!groups[group]) {
        groups[group] = [];
      }
  
      groups[group].push(field);
    });
  
    return groups;
  }, [customFields]);

  useEffect(() => {
    if(!userId && !userData) return;
      handleApprover(userData?.DepartmentHead, userData?.DeptHeadId, userData?.ImmediateSupervisor, userData?.SuperiorId)
      setEmpDetails({ EmployeeId: userData?.EmployeeId, FullName: userData?.FullName, FirstName: userData?.FirstName, LastName: userData?.LastName, EmailAddress: userData?.EmailAddress })
  }, [userId, userData])

  const handleApprover = (DH: string, DHId: string, IS: string, ISId: string) => {
    setApproverNames({
      ISName: IS ?? "",
      ISId: ISId ?? "",
      DHName: DH ?? "",
      DHId: DHId ?? ""
    });
  }

  if (loading && userData) return <Loader></Loader>
  
  return (
    <MainLayout title="">
    <Content className="incident-page">
      
      {/* HEADER */}
      <div className="incident-header">
        <h1>Create a Ticket</h1>
        <p>Submit a request to report an issue or get support.</p>
      </div>

      <Row gutter={24}>
        
        {/* LEFT FORM */}
        <Col xs={24} lg={16}>
          <Card className="form-card">
            <Form layout='vertical' disabled={isSubmit} form={form} onFinish={onFinish} initialValues={{ EmployeeId: userId }}>

              <Form.Item label="Who does this issue affect?" name="EmployeeId" rules={[{ required: true }]}>
                <StyledSelect placeholder="Select employee" 
                showSearch
                optionFilterProp="label"
                onChange={(value) => {
                  const emp = finalEmp.find((e: vwAtKWEProps) => e.EmployeeId === value);
                  handleApprover(emp?.DepartmentHead, emp.DeptHeadId, emp?.ImmediateSupervisor, emp?.SuperiorId);
                  setEmpDetails({EmployeeId: emp?.EmployeeId, FullName: emp?.FullName, FirstName: emp?.FirstName, LastName: emp?.LastName, EmailAddress: emp?.EmailAddress})
                }} 
                  >
                  {finalEmp.map((emp: vwAtKWEProps) => (
                    <StyledSelect.Option
                       key={emp.EmployeeId} 
                       value={emp.EmployeeId}
                       label={emp.CompleteName}
                       style={{
                        fontWeight: emp.EmployeeId === userId ? 500 : 400,
                      }}>
                      <Space>
                      {emp.CompleteName}    { emp.EmployeeId === userId ? (
                          <Tag color="blue"> YOU</Tag>
                        )
                          : null
                      }
                      </Space>
                    </StyledSelect.Option>
                  ))}
                </StyledSelect>
              </Form.Item>


              <Form.Item
                  label="Select Category"
                  required
                  validateStatus={
                    selectedValues.length === 0 ? "error" : undefined
                  }
                  help={
                    selectedValues.length === 0
                      ? "Please select a category."
                      : undefined
                  }
                >
                  {levels?.map((level, index) => {
                    if (!Array.isArray(level)) return null;

                    return (
                      <StyledSelect
                        key={`level-${index}`}
                        placeholder={`Select category ${index + 1}`}
                        style={{ width: "100%", marginTop: 10 }}
                        value={selectedValues[index]}
                        onChange={(value) => handleChange(value, index)}
                      >
                        {level.map(item => (
                          <StyledSelect.Option
                            key={item.SystemId}
                            value={item.SystemId}
                          >
                            {item.Name}
                          </StyledSelect.Option>
                        ))}
                      </StyledSelect>
                    );
                  })}
                </Form.Item>

              <div>
                {Object.entries(groupedFields).map(([groupName, fields]) => {
                  
                  // ✅ CASE 1: NORMAL FIELDS (no group)
                  if (groupName === "___NO_GROUP___") {
                    return fields.map(field => (
                      <Form.Item
                        key={`${groupName}-${field.FieldName}`}
                        name={field.FieldName}
                        label={field.FieldLabel}
                        rules={[{ required: true }]}
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
                            rules={[{ required: true }]}
                          >
                            {renderField(field)}
                          </Form.Item>
                        ))}
                      </Card>
                    );
                  }

                  // 🔥 CASE 3: REPEATABLE GROUP
                  return (
                    <Form.List key={groupName} name={groupName}
                      rules={[
                        {
                          validator: async (_, value) => {
                            if (!value || value.length === 0) {
                              return Promise.reject(
                                new Error(`Please add at least one ${groupName}.`)
                              );
                            }
                          },
                        },
                      ]}
                    >
                      {(groupItems, { add, remove }, { errors }) => (
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
                            {errors.length > 0 && (
                              <Tag color="error">
                                <Form.ErrorList errors={errors} />
                              </Tag>
                            )}
                            <Button type="dashed" onClick={() => add()}>
                              + Add {groupName}
                            </Button>
                          </div>
                        </>
                      )}
                    </Form.List>
                  );
                })}
              </div>

              {
                modules?.length > 0 ? (

                <StyledTable
                  data={modules}
                  rowKey="module"
                  pagination={false}
                  rowSelection={rowSelection}
                  columns={[
                    {
                      title: "Module",
                      dataIndex: "label"
                    },
                    {
                      title: "Access",
                      render: (_, record: ModuleProps) => (
                        <Tag color={record.hasAccess ? "green" : "red"}>
                          {record.hasAccess ? "Granted" : "No Access"}
                        </Tag>
                      )
                    },
                  ]}
                />
                ):
                null
              }


              {/* ACTION BUTTONS */}
              <div className="form-actions">
                <Link to="/ticketCreation">
                  <Button icon={<ArrowLeftOutlined />}>
                    Go Back
                  </Button>
                </Link>

                <Button type="primary" htmlType='submit'>
                  Submit Request
                </Button>
              </div>

            </Form>

          </Card>
        </Col>

        {/* RIGHT PANEL */}
        <Col xs={24} lg={8}>
          
            <Card className="side-card">
              <h3>Requestor Details</h3>
              <ul style={{ letterSpacing: 0.5 }}>
                <li> Requestor Name : <span style={{ fontWeight: 600}}> {formatName(userData?.FullName)} </span> </li>
                <li> Department : <span style={{ fontWeight: 600}}> {userData?.Department} </span> </li>
                <li> Date : <span style={{ fontWeight: 600}}> {today}</span> </li>
              </ul>
            </Card>

            <Card className="side-card">
              <h3>Reminders before submitting: </h3>
              <ul style={{ letterSpacing: 0.5 }}>
                <li> Ensure employee details are correct </li>
                <li> Provide complete information </li>
                <li> Attach required documents if needed </li>
              </ul>
            </Card>

            <Card className="side-card modern-timeline">
              <h3>Approval Flow</h3>
              <Timeline
                items={approvals.map((step, index) => ({
                  dot: <CheckCircleFilled className="timeline-dot" />,
                  children: (
                    <div className="timeline-item" style={{ letterSpacing: 0.7 }}>
                      <div className="timeline-title">
                      {
                        step.ApproverType === "Dynamic Superior" ? (
                          <>
                            {/* {approverNames?.ISName}{" "} */}
                            {getFullName(approverNames.ISId, employees)}{" "}
                            <Tag color="orange">{step.Description}</Tag>
                          </>
                        ) : step.ApproverType === "Dynamic Manager" ? (
                          <>
                            {getFullName(approverNames.DHId, employees)}{" "}
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
            </Card>
        </Col>
      </Row>
    </Content>
    </MainLayout>
  );
}

export default TicketCreationForm
