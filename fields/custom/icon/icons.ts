const isIconName = (value: unknown): value is string =>
  typeof value === "string" && /^[a-z0-9-]+$/.test(value);

const formatIconLabel = (name: string) =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export { formatIconLabel, isIconName };
