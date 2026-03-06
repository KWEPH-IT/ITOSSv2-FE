import { useEffect, useState } from "react";
import { fetchAll } from "../../services/configuration/systemProfile_services";

export const getSystems = () => {
    const [systems, setSystems] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAllSystems = async () => {
        try{
            setLoading(true);
            const data = await fetchAll();
            setSystems(data);
        }
        catch(error){
            console.error("Failed to fetch systems:", error);
            setError("Failed to fetch systems!")
        }finally{
            setLoading(false)
        }
    };
    useEffect(() =>{
        fetchAllSystems();
    }, [])

    return { systems, loading, error, refetch: fetchAllSystems }
}