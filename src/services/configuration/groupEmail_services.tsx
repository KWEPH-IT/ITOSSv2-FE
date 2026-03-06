import API from "../../api/api";

export const fetchAllGroupEmail = async() => {
    try{
        const response = await API.get(`/api/getGroupEmails`);
        return response.data;
    }
    catch(error){
        console.error("Error fetching group Emails:", error);
        throw error;
    }
}