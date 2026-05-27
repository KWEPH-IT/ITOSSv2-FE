import API from "../api/api";

export const logAction = async (
  employeeId: string,
  action: string,
  details?: string
) => {
  try {
    await API.post(`/auth/action-logger`, {
      employeeId,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to save action log", error);
  }
};


export const handleLoggedAction = async (
    employeeId: string,
    action: string,
    details: string,
  ) => {
  
    await logAction(
      employeeId,
      action,
      details
    );

  };