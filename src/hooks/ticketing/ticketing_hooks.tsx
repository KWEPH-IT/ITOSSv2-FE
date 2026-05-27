import { useEffect, useState } from "react";
import { fetchTickets } from "../../services/ticketing/ticketing_services";

type TicketFilters = {
  requestor?: string | null;
  status?: string;
  status_view?: string;
  ticketno?: string; 
};

export const useTickets = (filters: TicketFilters) => {
  const [ticket, setTicket] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await fetchTickets(filters);
      setTicket(res);
    } catch (err: any) {
      setError(err.message || "Error fetching tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [filters]); // 🔥 refetch when filters change

  return { ticket, loading, error, refetch: loadTickets };
};