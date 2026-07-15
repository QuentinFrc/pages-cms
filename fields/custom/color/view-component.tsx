"use client";

import { isCssColor } from "./color";

const ViewComponent = ({ value }: { value?: string | null }) => {
  if (typeof value !== "string" || value.length === 0) return null;
  const valid = isCssColor(value);
  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-full border px-2 py-0.5 text-sm font-medium">
      <span
        className="size-3 shrink-0 rounded-sm border"
        style={{ backgroundColor: valid ? value : "transparent" }}
      />
      <span className="truncate">{value}</span>
    </span>
  );
};

export { ViewComponent };
