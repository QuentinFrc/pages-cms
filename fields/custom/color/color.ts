import { parse, formatHex } from "culori";

const isCssColor = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  try {
    return parse(trimmed) !== undefined;
  } catch {
    return false;
  }
};

const toPickerHex = (value: string | null | undefined): string => {
  if (typeof value !== "string" || value.trim().length === 0) return "#000000";
  try {
    const hex = formatHex(value.trim());
    return hex ?? "#000000";
  } catch {
    return "#000000";
  }
};

export { isCssColor, toPickerHex };
