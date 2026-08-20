import API from "../../api/api";

export interface AssignTicketPayload {
    ticket_no: string;
    categoryName?: string;
    assignedToId: string;
    assignedToName: string;
    assignedToEmail: string;
}

export const assignTicket = async (payload: AssignTicketPayload) => {
    const response = await API.post('/api/assign', payload);
    return response.data;
};