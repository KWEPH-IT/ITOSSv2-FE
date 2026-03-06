import { useEffect, useState } from "react";
import { fetchAllTicketCateg } from "../../services/configuration/ticketCateg_services";

export const useTicketCategs = () => {
    const [categ, setCategs] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAllCategs = async () => {
        try{
            setLoading(true);
            const data = await fetchAllTicketCateg();
            setCategs(data);
        }
        catch(error){
            console.error("Failed to fetch categories:", error);
            setError("Failed to fetch categories!")
        }finally{
            setLoading(false)
        }
    };
    useEffect(() =>{
        fetchAllCategs();
    }, [])

    return { categ, loading, error, refetch: fetchAllCategs }
}