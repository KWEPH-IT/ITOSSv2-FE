import API from "../../api/api";

export const fetchAllAssetReq = async() => {
    try{
        const response = await API.get(`/api/getAssetReq`);
        return response.data;
    }
    catch(error){
        console.error("Error fetching asset requsition:", error);
        throw error;
    }
}