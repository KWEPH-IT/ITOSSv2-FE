import { useMemo } from "react";
import { useTickets } from "../hooks/ticketing/ticketing_hooks";
import { useTicketApprovers } from "../hooks/configuration/ticketApprover_hooks";
import { useAuth } from "../context/AuthContext";
import { TicketApprover } from "../types/TicketsCateg_drawer";
import { TicketProps } from "../types/Ticketing_drawer";

export const useApprovalCounter = () => {
  const filters = useMemo(() => ({}), []);
  const { ticket = [] } = useTickets(filters);
  const { approver = [] } = useTicketApprovers();
  const { userId } = useAuth();

  const getLevelConfig = (
    ticket: TicketProps,
    config: TicketApprover[]
  ) => {
    return config.find(
      c =>
        c.CategoryId === ticket.RequestType &&
        c.LevelNo === ticket.CurrentLevel + 1
    );
  };

  const isCurrentApprover = (
    ticket: TicketProps,
    config: TicketApprover[],
    userId: string
  ) => {
    if (ticket.Status === "Cancelled Request") {
      return false;
    }
  
    const levelConfig = getLevelConfig(ticket, config);
  
    const isAssignedTechnician =
      ticket.Status === "Assigned" &&
      ticket.AssignedTo === userId;
  
    let isWorkflowApprover = false;
  
    if (levelConfig) {
      switch (levelConfig.ApproverType) {
        case "Dynamic Superior":
          isWorkflowApprover = ticket.ISId === userId;
          break;
  
        case "Dynamic Manager":
          isWorkflowApprover = ticket.DHId === userId;
          break;
  
        case "Specific User":
          isWorkflowApprover = levelConfig.ApproverValue === userId;
          break;
      }
    }
  
    return isAssignedTechnician || isWorkflowApprover;
  };

  const pendingApprovals = useMemo(() => {
    if (!userId) return [];

    return ticket.filter(t => {
      
      return isCurrentApprover(t, approver, userId);
    });
  }, [ticket, approver, userId]);

  return {
    approvalCount: pendingApprovals.length,
    pendingApprovals,
  };

};