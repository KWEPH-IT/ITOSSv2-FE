export const formatName = (name: string) => {
  if (!name) return "";

  // convert to lowercase first
  const lower = name.toLowerCase();

  // split by comma
  if (!lower.includes(',')) {
    return toProperCase(lower);
  }

  const [last, first] = lower.split(',').map(s => s.trim());

  return `${toProperCase(first)} ${toProperCase(last)}`;
};

export const toProperCase = (str: string) => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// First Name
export const NormalCase = (str :string) => {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const getInitials = (name: string) => {
  if (!name) return "";

  const [last, first] = name.split(',').map(s => s.trim());

  const firstName = first?.split(' ')[0];
  const lastName = last?.split(' ')[0];

  return (
    (firstName?.charAt(0) || "") +
    (lastName?.charAt(0) || "")
  ).toUpperCase();
};