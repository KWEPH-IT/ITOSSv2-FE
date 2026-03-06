import API from "../api/api";

const API_URL = import.meta.env.VITE_SERVER_API_URL

export const fetchUserData = async (userId : string) => {
    try{
        const response = await API.get(`${API_URL}/api/getUserProfile/${userId}`);
        return response.data;
    } catch (err){
        console.error("Error fetching user data:", err)
        throw err;
    }
}