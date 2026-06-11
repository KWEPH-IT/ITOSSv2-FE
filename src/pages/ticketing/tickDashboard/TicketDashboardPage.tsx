import { useState, useMemo, useEffect } from "react";
import MainLayout from "../../MainLayout";
import "../../../styles/ticketDashboard.css"
import { StyledTable } from "../../../components/StyledTable";
import { SearchContainer, SearchInput, } from "../../../components/StyledComponents";
import { Row, Col, Space, Checkbox, Dropdown, Button } from "antd";
import { SearchOutlined, SettingOutlined, MenuOutlined } from "@ant-design/icons";
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
dayjs.extend(relativeTime);


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

type CheckedKey = "unassigned" | "assigned" | "closed";

const TicketDashboardPage = () => {
    const filters = useMemo(() => ({}), []);
    const { ticket, loading } = useTickets(filters);
    const { approver } = useTicketApprovers();
    const [ search, setSearch ] = useState("");
    const [ filtered, setFiltered ] = useState<TicketProps[]>([])

    const [checked, setChecked] = useState<Record<CheckedKey, boolean>>({
        unassigned: false,
        assigned: false,
        closed: false,
      });
    const navigate = useNavigate();

    const maxLevelPerCategory = useMemo(() => {
        return approver?.reduce((acc: any, item: any) => {
          const cat = item.CategoryId;
          const lvl = item.LevelNo;
      
          if (!acc[cat] || lvl > acc[cat]) {
            acc[cat] = lvl;
          }
      
          return acc;
        }, {});
      }, [approver]);

    const finalTickets = useMemo(() => {
        if (!ticket) return [];
      
        return ticket.filter((t: any) => {
          const maxLevel = maxLevelPerCategory[t.RequestType];
          return t.CurrentLevel === maxLevel;
        });
    }, [ticket, maxLevelPerCategory]);

    const getTicketBucket = (t: any) => {
        if (t.Status === "Closed") return "closed";
        if (t.Assigned) return "assigned";
        return "unassigned";
    };

    const filteredTickets = useMemo(() => {
        const activeFilters: string[] = [];
      
        if (checked.unassigned) activeFilters.push("unassigned");
        if (checked.assigned) activeFilters.push("assigned");
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
        { title: "Status", key: "Status", dataIndex: "Status" },
        { title: "Assigned To", key: "AssignedTo", dataIndex: "AssignedTo" },
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
    
          return (
            (t.TicketNumber?.toLowerCase() || "").includes(search) ||
            (t.RequestName?.toLowerCase() || "").includes(search) ||
            (t.RequestorName?.toLowerCase() || "").includes(search)
          )
        });
          setFiltered(filtered);
      }, [filteredTickets, search])

    if (loading) return <Loader />;

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
                        { label: "Closed", value: "closed" },
                    ]}
                    value={(Object.keys(checked) as CheckedKey[]).filter(
                        (k) => checked[k]
                    )}
                    onChange={(checkedValues) => {
                        const values = checkedValues as CheckedKey[];

                        setChecked({
                        unassigned: values.includes("unassigned"),
                        assigned: values.includes("assigned"),
                        closed: values.includes("closed"),
                        });
                    }}
                    />
                </Space>

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