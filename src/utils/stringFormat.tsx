export const formatName = (name: string) =>
    name
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());