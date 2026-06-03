import { useState, useEffect } from "react";
import { fetchApprovalHistory } from "../../services/ticketing/ticketing_approval_services";


export const useApprovalHistory = () => {
    const [history, setHistory] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const fetchAllApproval = async () => {
      try {
        setLoading(true);
        const data = await fetchApprovalHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch approval history:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
        fetchAllApproval();
      },[]);
  
    return { history, loading, error, refetch: () => fetchAllApproval() };
  };
  