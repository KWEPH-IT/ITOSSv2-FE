export const STORAGE_KEY = "ticket_dashboard_columns";

export const getSavedColumnState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const saveColumnState = (state: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};