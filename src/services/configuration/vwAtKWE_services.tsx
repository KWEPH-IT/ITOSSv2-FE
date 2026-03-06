import API from "../../api/api";

export const fetchAll = async() =>{
    try{
        const response = await API.get(`/api/getHREmp`);
        return response.data;
    }
    catch (error){
        console.error("Error fetching employees:", error);
        throw error;
    }
}