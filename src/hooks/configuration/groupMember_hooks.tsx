import { useState, useEffect } from "react";
import { fetchAllMember } from "../../services/configuration/groupMember_services";


export const useGroupMembers = (sa: string) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllMembers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllMember(sa);
      setMembers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sa) fetchAllMembers();
  }, [sa]);

  return { members, loading, refetch: fetchAllMembers };
};
