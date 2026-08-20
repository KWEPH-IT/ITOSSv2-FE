// hooks/ticketing/useTicketAssignment.ts
import { useState } from 'react';
import { message } from 'antd';
import { assignTicket, AssignTicketPayload } from '../../services/ticketing/ticketing_assignment.services';
import { handleLoggedAction } from '../../utils/Logger';

interface UseTicketAssignmentParams {
    userId?: string | undefined;
    refetch: () => Promise<void>;
    onSuccess?: () => void; // e.g. closeModal
}

export const useTicketAssignment = ({ userId, refetch, onSuccess }: UseTicketAssignmentParams) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleAssignment = async (payload: AssignTicketPayload) => {
        if (!payload.assignedToId) {
            return false;
        }

        setIsLoading(true);
        try {
            const data = await assignTicket(payload);
            message.success(data.message);

            if (userId) {
                handleLoggedAction(userId, 'TICKET ASSIGNMENT', `Assigned ticket to ${payload.assignedToName}`);
            }

            await refetch();
            onSuccess?.();
            return true;
        } catch (e: any) {
            console.error(e);
            message.error(e.response?.data?.message || 'Failed to assign ticket');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { handleAssignment, isLoading };
};