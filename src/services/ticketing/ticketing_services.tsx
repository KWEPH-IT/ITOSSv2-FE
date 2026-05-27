import API from "../../api/api";

export const fetchTickets = async (params?: Record<string, any>) => {
    const cleanParams = Object.fromEntries(
        Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null)
    );

    const response = await API.get(`/api/ticket`, {
        params: cleanParams
    });

    return response.data;
};