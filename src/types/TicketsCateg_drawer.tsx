export interface TicketCategProps {
    SystemId: number;
    Name: string;
    ParentId: number;
    Inhouse: string;
    Description: string;
    CreatedBy: string;
    DateModified: string;
    ModifiedBy: string;
}

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface TicketCustomFields {
    CategoryId: number;
    FieldName: string;
    FieldType: string;
    FieldLabel: string;
    IsGroup: string;
    GroupName: string;
    IsRepeatable: string;
    ValueMode: string | null;
    SelectSourceType: string | null;
    SelectSourceValue: string | null; 
    TableName: string | null;
    ValueColumn: string | null;
    LabelColumn: string | null;
    options?: SelectOption[]
    StaticOptions?: SelectOption[];
}

export interface TicketApprover {
    CategoryId: number;
    ApproverType: "Role" | "Specific User" | "Dynamic Superior" | "Dynamic Manager";
    ApproverValue: string;
    Description: string;
}