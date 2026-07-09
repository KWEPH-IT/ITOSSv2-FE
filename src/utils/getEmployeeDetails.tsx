import { vwAtKWEProps } from "../types/vwAtKWE_drawer";

export const getFullName = (
  approverValue: string,
  employees: vwAtKWEProps[]
) => {
  return (
    employees.find(
      (emp) =>
        emp.EmployeeId?.toLowerCase() === approverValue.toLowerCase()
    )?.FullName || "N/A"
  );
};