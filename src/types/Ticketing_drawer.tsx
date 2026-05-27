export interface TicketProps {
    SystemId: number,
    TicketNumber: string,
    RequestType: number,
    RequestName: string,
    Status:string,
    DateCreated: string,
    DateModified: string;
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