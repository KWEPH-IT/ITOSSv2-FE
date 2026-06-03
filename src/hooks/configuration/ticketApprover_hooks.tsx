import { useEffect, useState } from "react";
import { fetchAllTicketApprover } from "../../services/configuration/ticketApprover_services";

export const useTicketApprovers = () => {
    const [approver, setApprover] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAllApprovers = async () => {
        try{
            setLoading(true);
            const data = await fetchAllTicketApprover();
            setApprover(data);
        }
        catch(error){
            console.error("Failed to fetch approvers:", error);
            setError("Failed to fetch approvers!")
        }finally{
            setLoading(false)
        }
    };
    useEffect(() =>{
        fetchAllApprovers();
    }, [])

    return { approver, loading, error, refetch: fetchAllApprovers }
}