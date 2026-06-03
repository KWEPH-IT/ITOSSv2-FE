import API from "../../api/api";

export const fetchApprovalHistory = async() => {
    try{
        const response = await API.get(`/api/getapprovalhist`);
        return response.data;
    }
    catch(error){
        console.error("Error fetching approval history:", error);
        throw error;
    }
}