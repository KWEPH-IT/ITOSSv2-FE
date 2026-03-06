import API from "../../api/api";

export const fetchAllTicketCateg = async() => {
    try{
        const response = await API.get(`/api/getTicketCateg`);
        return response.data;
    }
    catch(error){
        console.error("Error fetching Ticket Categories:", error);
        throw error;
    }
}