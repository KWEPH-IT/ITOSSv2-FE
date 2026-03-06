import { useState, useEffect } from "react";
import { fetchAll } from "../../services/configuration/dbColumn_services";


export const getDBColumns = (sa: string) => {
    const [columns, setColumns] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const fetchAllDBColumns = async () => {
      try {
        setLoading(true);
        const data = await fetchAll(sa);
        setColumns(data);
      } catch (err) {
        console.error("Failed to fetch db columns:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      if (sa) {
        fetchAllDBColumns();
      }
    }, [sa]);
  
    return { columns, loading, error, refetch: () => fetchAllDBColumns() };
  };
  