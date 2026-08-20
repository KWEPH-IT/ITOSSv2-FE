import { useMemo } from "react";
import { useTickets } from "../hooks/ticketing/ticketing_hooks";
import { useTicketApprovers } from "../hooks/configuration/ticketApprover_hooks";
import { useAuth } from "../context/AuthContext";
import { TicketApprover } from "../types/TicketsCateg_drawer";
import { TicketProps } from "../types/Ticketing_drawer";

export const useApprovalCounter = (dept: string) => {
  const filters = useMemo(() => ({}), []);
  const { ticket = [] } = useTickets(filters);
  const { approver = [] } = useTicketApprovers();
  const { userId } = useAuth();

  // returns ALL config rows at the ticket's next level (handles OR/multiple approvers per level)
  const getLevelConfigs = (
    ticket: TicketProps,
    config?: TicketApprover[] | null
  ): TicketApprover[] => {
    if (!Array.isArray(config)) return [];

    return config.filter(
      c =>
        c.CategoryId === ticket.RequestType &&
        c.LevelNo === ticket.CurrentLevel + 1
    );
  };

  // highest LevelNo configured for this ticket's category (i.e. the max approval level)
  const getMaxLevel = (
    ticket: TicketProps,
    config?: TicketApprover[] | null
  ): number => {
    if (!Array.isArray(config)) return 0;

    const levelsForCategory = config
      .filter(c => c.CategoryId === ticket.RequestType)
      .map(c => c.LevelNo);

    return levelsForCategory.length ? Math.max(...levelsForCategory) : 0;
  };

  const isCurrentApprover = (
    ticket: TicketProps,
    config: TicketApprover[],
    userId: string
  ) => {
    if (ticket.Status === "Cancelled Request") {
      return false;
    }

    const levelConfigs = getLevelConfigs(ticket, config);

    const isAssignedTechnician =
      ticket.Status === "Assigned" &&
      ticket.AssignedTo === userId;

    const isWorkflowApprover = levelConfigs.some(levelConfig => {
      switch (levelConfig.ApproverType) {
        case "Dynamic Superior":
          return ticket.ISId === userId;

        case "Dynamic Manager":
          return ticket.DHId === userId;

        case "Specific User":
          return levelConfig.ApproverValue === userId;

        default:
          return false;
      }
    });

    return isAssignedTechnician || isWorkflowApprover;
  };

  // IT Team: ticket has fully passed all approval levels but has no assignee yet
  const isUnassignedAtMaxLevel = (ticket: TicketProps, config: TicketApprover[]) => {
    if (ticket.Status === "Cancelled Request") return false;

    const maxLevel = getMaxLevel(ticket, config);

    return (
      maxLevel > 0 &&
      ticket.CurrentLevel >= maxLevel &&
      (!ticket.AssignedTo || ticket.AssignedTo === "")
    );
  };

  const pendingApprovals = useMemo(() => {
    if (!userId) return [];

    return ticket.filter(t => {
      if (dept === "IT") {
        return (
          isCurrentApprover(t, approver, userId) ||
          isUnassignedAtMaxLevel(t, approver)
        );
      }

      return isCurrentApprover(t, approver, userId);
    });
  }, [ticket, approver, userId, dept]);

  return {
    approvalCount: pendingApprovals.length,
    pendingApprovals,
  };
};