import API from "../../api/api";

export const fetchAllMember = async(sa: string) => {
    try{
        const response = await API.get(`/api/getGroupMember/${sa}`, {
            validateStatus: (status) => status < 500  // treat 404 as success
        });

        if (response.status === 404) {
            return [];
        }

        return response.data;
    }
    catch(err :any){
        if (err.response && err.response.status === 404) {
            return [];  
         }
        console.error("Error fetching Group Members:", err);
        throw err;
    }
}