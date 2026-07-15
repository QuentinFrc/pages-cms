"use client";

import { DynamicIcon } from "lucide-react/dynamic";

import { formatIconLabel, isIconName } from "./icons";

const ViewComponent = ({ value }: { value?: string | null }) => {
  if (typeof value !== "string" || value.length === 0) return null;

  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-full border px-2 py-0.5 text-sm font-medium">
      {isIconName(value) ? (
        <>
          <DynamicIcon name={value} className="size-3 shrink-0" />
          <span className="truncate">{formatIconLabel(value)}</span>
        </>
      ) : (
        <span className="truncate capitalize">{value}</span>
      )}
    </span>
  );
};

export { ViewComponent };
