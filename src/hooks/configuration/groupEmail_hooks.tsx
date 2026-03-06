import { useState, useEffect } from "react";
import { fetchAllGroupEmail } from "../../services/configuration/groupEmail_services"; 


export const useGroupEmails = () => {
    const [group, setGroups] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const fetchAllEmailGroups = async () => {
      try {
        setLoading(true);
        const data = await fetchAllGroupEmail();
        setGroups(data);
      } catch (err) {
        console.error("Failed to fetch group emails:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
        fetchAllEmailGroups();
      },[]);
  
    return { group, loading, error, refetch: () => fetchAllEmailGroups() };
  };
  