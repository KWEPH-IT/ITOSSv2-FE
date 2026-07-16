import { useState, useMemo, useEffect } from "react";
import MainLayout from "../../MainLayout";
import "../../../styles/ticketDashboard.css"
import { StyledTable } from "../../../components/StyledTable";
import { SearchContainer, SearchInput } from "../../../components/StyledComponents";
import { Row, Col, Space, Checkbox, Dropdown, Button, Tag } from "antd";
import { SearchOutlined, SettingOutlined, MenuOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { useTickets } from "../../../hooks/ticketing/ticketing_hooks";
import { useTicketApprovers } from "../../../hooks/configuration/ticketApprover_hooks";
import { TicketProps } from "../../../types/Ticketing_drawer";
import { Loader } from "../../../components/Loader";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable,arrayMove} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getSavedColumnState, saveColumnState } from "../../../utils/columSorter";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getFullName } from "../../../utils/getEmployeeDetails";
import { getEmployees } from "../../../hooks/configuration/vwAtKWE_hooks";
import { vwAtKWEProps } from "../../../types/vwAtKWE_drawer";
import { useAuth } from "../../../context/AuthContext";
dayjs.extend(relativeTime);


type ButtonColor =
  | "default"
  | "blue"
  | "cyan"
  | "gold"
  | "green"
  | "lime"
  | "magenta"
  | "orange"
  | "pink"
  | "purple"
  | "red"
  | "yellow"
  | "volcano"
  | "geekblue"
  | "primary"
  | "danger";

interface SortableColumnProps {
  id: string;
  title: string;
}

const SortableColumn = ({
  id,
  title,
}: SortableColumnProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    width: "100%", 
    transform: CSS.Transform.toString(transform),
    transition,
    padding: 8,
    marginBottom: 6,
    border: "1px solid #f0f0f0",
    borderRadius: 6,
    background: "#fff",
    cursor: "grab",
  };


  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        <Checkbox value={id} style={{ flex: 1, fontSize: 12 }}>
          {title}
        </Checkbox>

        <MenuOutlined
          {...attributes}
          {...listeners}
          style={{
            cursor: "grab",
            color: "#999",
            fontSize: 12
          }}
        />
      </div>
    </div>
  );
};

type CheckedKey = "unassigned" | "assigned" | "processing" | "closed";

const TicketDashboardPage = () => {
    const filters = useMemo(() => ({}), []);
    const { ticket, loading } = useTickets(filters);
    const { approver } = useTicketApprovers();
    const [ search, setSearch ] = useState("");
    const [ filtered, setFiltered ] = useState<TicketProps[]>([]);
    const { employees, loading: empLoading } = getEmployees();
    const [ selectedMembers, setSelectedMembers ] = useState<string[]>([]);
    const [showMyTickets, setShowMyTickets] = useState(false);
    const { userId } = useAuth();
    const navigate = useNavigate();

    const employeeTagColors: Record<string, ButtonColor> = {
      K845: "purple",
      K1815: "blue",
      K1761: "pink",
      K1709: "yellow",
      K1124: "lime", 
      K935: "cyan",
      K1035: "geekblue"
    };

    const getTagColor = (employeeId: string) =>
      employeeTagColors[employeeId] || "default";
    
    const userColor = userId ? getTagColor(userId) : "default";

    const [checked, setChecked] = useState<Record<CheckedKey, boolean>>({
        unassigned: false,
        assigned: false,
        processing: false,
        closed: false,
      });
    

    const maxLevelPerCategory = useMemo(() => {
        if (!approver) return {};
      
        return approver.reduce((acc: any, item: any) => {
          const cat = item.CategoryId;
          const lvl = item.LevelNo;
      
          if (!acc[cat] || lvl > acc[cat]) {
            acc[cat] = lvl;
          }
      
          return acc;
        }, {});
    }, [approver]);

    const finalTickets = useMemo(() => {
        if (!ticket || !maxLevelPerCategory) return [];
        
        return ticket.filter((t: any) => {
            const maxLevel = maxLevelPerCategory?.[t.RequestType];
        
            return (t.CurrentLevel === maxLevel ||
              t.CurrentLevel >= maxLevel
            );
        });
    }, [ticket, maxLevelPerCategory]);


    const getTicketBucket = (t: TicketProps) => {
        if (t.Status === "Closed") return "closed";
        if (t.Status === "On Process") return "processing";
        if (t.AssignedTo) return "assigned";
        return "unassigned";
    };

    const getStatusTagColor = (status: string) => {
        if(status === "Assigned") return "gold";
        if(status === "On Process") return "blue";
        if(status === "For Closing") return "cyan";
        if(status === "Closed") return "green";
        return "orange"; 
    };

    const filteredTickets = useMemo(() => {
        const activeFilters: string[] = [];
      
        if (checked.unassigned) activeFilters.push("unassigned");
        if (checked.assigned) activeFilters.push("assigned");
        if (checked.processing) activeFilters.push("processing");
        if (checked.closed) activeFilters.push("closed");
      
        // if nothing selected → show all final tickets
        if (activeFilters.length === 0) {
          return finalTickets;
        }
      
        return finalTickets.filter((t: any) =>
          activeFilters.includes(getTicketBucket(t))
        );
      }, [finalTickets, checked]);

    const allColumns = [
        { title: "Ticket Number", key: "TicketNumber", dataIndex: "TicketNumber" },
        { title: "Request Type", key: "RequestName", dataIndex: "RequestName" },
        { title: "Requestor Name", key: "RequestorName", dataIndex: "RequestorName" },
        { title: "Request For", key: "RequestForName", dataIndex: "RequestForName" },
        { title: "Status", key: "Status", dataIndex: "Status",
          render: (status : string) => (
            <Tag color={getStatusTagColor(status)} style={{ fontSize: '10px'}}>
              {status}
            </Tag>
          )
        },

        { title: "Assigned To", key: "AssignedTo", dataIndex: "AssignedTo", 
          render: (assignedTo: string) => (
            assignedTo  ? (
              <Tag color={getTagColor(assignedTo)} 
                style={{
                  fontSize: 10,
                  maxWidth: 120,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                >
                {getFullName(assignedTo, employees)}
              </Tag>
              ) : null
          ),
        },
        { title: "Created On", key: "CreatedOn", dataIndex: "DateCreated", render: (text: string) => dayjs(text).fromNow() },
        { title: "Date Created", key: "DateCreated", dataIndex: "DateCreated", render: (text: string) => dayjs(text).format("YYYY-MM-DD") },
        
    ];

    const saved = getSavedColumnState();
    const [visibleKeys, setVisibleKeys] = useState<string[]>(
        saved?.visibleKeys || allColumns.map((c) => c.key)
    );
  
    const [columnOrder, setColumnOrder] = useState<string[]>(
        saved?.columnOrder || allColumns.map((c) => c.key)
    );

    const updateStorage = (nextVisible: string[], nextOrder: string[]) => {
        saveColumnState({
        visibleKeys: nextVisible,
        columnOrder: nextOrder,
        });
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        setColumnOrder((items) => {
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);

            const newOrder = arrayMove(items, oldIndex, newIndex);

            updateStorage(visibleKeys, newOrder);

            return newOrder;
        });
    };
    
    
    const memberFilterMenu = (
      <div style={{ padding: 12, backgroundColor: '#FFF', fontSize: 12, letterSpacing: 0.7 }}>
        <Checkbox.Group
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
          value={selectedMembers}
          onChange={(values) => setSelectedMembers(values as string[])}
        >
          {employees && 
            (employees
              .filter((emp: vwAtKWEProps) => emp.Department === "IT")
              .map((emp: vwAtKWEProps) => (
              <Checkbox
                key={emp.EmployeeId}
                value={emp.EmployeeId}
              >
                {emp.FullName}
              </Checkbox>
            )))}
        </Checkbox.Group>
      </div>
    );


    const columns = columnOrder
        .map((key) =>
        allColumns.find((column) => column.key === key)
        )
        .filter(
        (column): column is NonNullable<typeof column> =>
            !!column && visibleKeys.includes(column.key)
    );

    const handleVisibleChange = (values: string[]) => {
        setVisibleKeys(values);
      
        updateStorage(values, columnOrder);
    };


    const menu = (
        <div
        style={{
            padding: 10,
            background: "#fff",
            minWidth: 200,
        }}
        >
        <Checkbox.Group
            value={visibleKeys}
            onChange={handleVisibleChange}
        >
            <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            >
            <SortableContext
                items={columnOrder}
                strategy={verticalListSortingStrategy}
            >
                {columnOrder.map((key) => {
                const col = allColumns.find(
                    (c) => c.key === key
                );

                if (!col) return null;

                return (
                    <SortableColumn
                    key={key}
                    id={key}
                    title={String(col.title)}
                    />
                );
                })}
            </SortableContext>
            </DndContext>
        </Checkbox.Group>
        </div>
    );

    const handleSearch = (e : React.ChangeEvent<HTMLInputElement>) =>{
        const value = e.target.value.toLowerCase();
        setSearch(value)
    }

    useEffect(() => {
      const filtered = filteredTickets.filter((t: TicketProps) => {
    
        const matchesSearch =
          (t.TicketNumber?.toLowerCase() || "").includes(search) ||
          (t.RequestName?.toLowerCase() || "").includes(search) ||
          (t.RequestorName?.toLowerCase() || "").includes(search);
    
        const matchesMember =
          selectedMembers.length === 0 ||
          selectedMembers.includes(t.AssignedTo);
    
        const matchesMyTickets =
          !showMyTickets || t.AssignedTo === userId;
    
        return matchesSearch && matchesMember && matchesMyTickets;
      });
    
      setFiltered(filtered);
    
    }, [filteredTickets, search, selectedMembers, showMyTickets, userId]);

    if (loading || empLoading) return <Loader />;

    return (
        <MainLayout title="Service Dashboard">
        <Row gutter={[16, 16]}>
            <Col span={24}>
            <SearchContainer>
                <SearchInput placeholder="Search by Ticket Number, Request Type" style={{ width: "400px" }} suffix={<SearchOutlined />} value={search} onChange={handleSearch} />
            </SearchContainer>
            </Col>
        </Row>

        <Row gutter={[16, 16]}>
            <Col span={24}>
            <div
                style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                }}
            >
                <Space>
                  <Checkbox.Group
                      options={[
                          { label: "Unassigned", value: "unassigned" },
                          { label: "Assigned", value: "assigned" },
                          { label: "On Process", value: "processing" },
                          { label: "Closed", value: "closed" }
                      ]}
                      value={(Object.keys(checked) as CheckedKey[]).filter(
                          (k) => checked[k]
                      )}
                      onChange={(checkedValues) => {
                          const values = checkedValues as CheckedKey[];

                          setChecked({
                            unassigned: values.includes("unassigned"),
                            assigned: values.includes("assigned"),
                            processing: values.includes("processing"),
                            closed: values.includes("closed"),
                          });
                      }}
                  />
                </Space>
                
                <Space>
                  <Button variant={showMyTickets ? "solid" : "outlined"} color={userColor} icon={<UserOutlined />} onClick={() => setShowMyTickets(prev => !prev)}> My Tickets </Button>
                  <Dropdown
                    trigger={["click"]}
                    dropdownRender={() => memberFilterMenu}
                  >
                      <Button icon={<TeamOutlined />}>
                        Assigned To
                      </Button>
                  </Dropdown>

                  <Dropdown
                      trigger={["click"]}
                      dropdownRender={() => menu}
                      destroyOnHidden={false}
                      overlayStyle={{ width: 200 }}
                  >
                  <Button icon={<SettingOutlined />}>
                      Sort Columns
                  </Button>
                  </Dropdown>

                  


                </Space>

                
            </div>
            </Col>
        </Row>

        <Row
            gutter={[16, 16]}
            style={{ marginTop: 30 }}
        >
            <Col span={24}>
            <StyledTable
                className="table"
                columns={columns}
                data={filtered}
                pagination={{ size: "small" }}
                rowKey="TicketNumber"
                tableLayout="fixed"
                onRow={(record:TicketProps) => ({
                    style: {
                      fontSize: "12px",
                      cursor: "pointer"
                    },
    
                    onClick: () => {
                      navigate(`/ticketDetails/${btoa(record.TicketNumber)}`) 
                    }
                  })}  
            />
            </Col>
        </Row>
        </MainLayout>
    );
};

export default TicketDashboardPage;