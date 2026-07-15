const HEX_COLOR_REGEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const isHexColor = (value: unknown): value is string =>
  typeof value === "string" && HEX_COLOR_REGEX.test(value);

const normalizeHex = (value: string): string => {
  const trimmed = value.trim().toLowerCase();
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
};

const expandShortHex = (value: string): string => {
  const normalized = normalizeHex(value);
  if (normalized.length === 4 || normalized.length === 5) {
    const chars = normalized.slice(1).split("");
    return `#${chars.map((c) => c + c).join("")}`;
  }
  return normalized;
};

const toPickerHex = (value: string | null | undefined): string => {
  if (typeof value !== "string" || value.length === 0) return "#000000";
  if (!isHexColor(value)) return "#000000";
  const expanded = expandShortHex(value);
  return expanded.slice(0, 7);
};

export { HEX_COLOR_REGEX, isHexColor, normalizeHex, expandShortHex, toPickerHex };
