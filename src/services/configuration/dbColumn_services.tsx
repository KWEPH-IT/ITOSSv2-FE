import API from "../../api/api";

export const fetchAll = async(sa: string) => {
    try{
        const response = await API.get(`/api/getDbColumns/${sa}`);
        return response.data;
    }
    catch(err){
        console.error("Error fetching DB Columns:", err);
        throw err;
    }
}