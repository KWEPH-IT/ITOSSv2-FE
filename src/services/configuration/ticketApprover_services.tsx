import API from "../../api/api";

export const fetchAllTicketApprover = async() => {
    try{
        const response = await API.get(`/api/getTicketApprover`);
        return response.data;
    }
    catch(error){
        console.error("Error fetching Ticket Approver:", error);
        throw error;
    }
}