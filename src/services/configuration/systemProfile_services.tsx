import API from "../../api/api";

export const fetchAll = async() =>{
    try{
        const response = await API.get(`/api/getSystems`);
        return response.data;
    }
    catch (error){
        console.error("Error fetching systems:", error);
        throw error;
    }
}