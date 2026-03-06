export interface TicketCategProps {
    SystemId: number;
    Name: string;
    ParentId: string;
    CreatedBy: string;
    DateModified: string;
    ModifiedBy: string;
}

export interface TicketCustomFields {
    CategoryId: number;
    FieldName: string;
    FieldType: string;
}

export interface TicketApporver {
    CategoryId: number;
    ApproverType: "Role" | "Specific User" | "Dynamic Superior" | "Dynamic Manager";
    ApproverValue: string;
}