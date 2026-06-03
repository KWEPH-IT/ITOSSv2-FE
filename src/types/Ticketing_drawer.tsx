export interface TicketProps {
    SystemId: number,
    TicketNumber: string,
    RequestType: number,
    RequestName: string,
    CurrentLevel: number,
    Status:string,
    ISId: string,
    DHId:string,
    InhouseName: string,
    RequestorName: string,
    RequestForName: string,
    DateCreated: string,
    DateModified: string,
    custom_fields?: {
        CustomFields?: any[]
    }[],
    modules?: {
        ModuleName?: any[]
    }[],
}

export interface ModuleProps {
    module: string,
    label: string,
    hasAccess: boolean
}

export interface TicketMessage {
    TicketNumber: string,
    Sender: string,
    SenderName: string,
    Message: string,
    Status: string,
    DateSent: string
}