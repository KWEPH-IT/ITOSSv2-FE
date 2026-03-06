import { useEffect, useState } from "react";
import { fetchAll } from "../../services/configuration/vwAtKWE_services";

export const getEmployees = () => {
    const [employees, setEmployees] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAllEmployees = async () => {
        try{
            setLoading(true);
            const data = await fetchAll();
            setEmployees(data);
        }
        catch(error){
            console.error("Failed to fetch employees:", error);
            setError("Failed to fetch employees!")
        }finally{
            setLoading(false)
        }
    };
    useEffect(() =>{
        fetchAllEmployees();
    }, [])

    return { employees, loading, error, refetch: fetchAllEmployees }
}