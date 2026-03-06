import { useEffect, useState } from "react";
import { fetchUserData } from "../services/userServices";

export const getUserData = (userId : string|null) => {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() =>{
        if (!userId){
            setUserData(null);
            return
        }

        const getUserInfo = async () => {
            try{
                setLoading(true);
                const data = await fetchUserData(userId);
                setUserData(data);
            }
            catch(error){
                console.error("Failed to fetch user data:", error);
            }finally{
                setLoading(false);
            }
        };

        getUserInfo();
    }, [userId])

    return {userData, loading}
}