export const statusColor = (status: string) => {
    switch (true) {
        case status.includes("Approved"):
            return "green";
        case status.includes("Submitted"):
            return "blue";
        case status.includes("Pending"):
            return "gold";
        case status.includes("For Processing"):
            return "purple";
        case status.includes("Declined"):
            return "red";
        default:
            return "default";
    }
  };