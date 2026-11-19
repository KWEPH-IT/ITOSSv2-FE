export const parseCustomFields = (raw: unknown): Record<string, any> => {
    if (!raw) return {};
    if (typeof raw === "object") return raw as Record<string, any>; // already parsed
    try {
      return JSON.parse(raw as string);
    } catch {
      return {};
    }
  };