import API from "../../api/api";

export const fetchAllEquipment = async() => {
    try{
        const response = await API.get(`/api/getEquipment`);
        return response.data;
    }
    catch(error){
        console.error("Error fetching equipment:", error);
        throw error;
    }
}