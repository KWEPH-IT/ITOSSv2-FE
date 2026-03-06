import { useEffect, useState } from "react";
import { fetchAll } from "../../services/configuration/emailAddress_services";

export const getEmailAddress = () => {
    const [email, setEmails] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAllEmails = async () => {
        try{
            setLoading(true);
            const data = await fetchAll();
            setEmails(data);
        }
        catch(error){
            console.error("Failed to fetch systems:", error);
            setError("Failed to fetch systems!")
        }finally{
            setLoading(false)
        }
    };
    useEffect(() =>{
        fetchAllEmails();
    }, [])

    return { email, loading, error, refetch: fetchAllEmails }
}