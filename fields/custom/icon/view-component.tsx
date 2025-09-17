"use client";

import { ICON_OPTIONS } from "./icons";

const ViewComponent = ({ value }: { value?: string | null }) => {
  if (typeof value !== "string" || value.length === 0) return null;

  const iconOption = ICON_OPTIONS.find((option) => option.value === value);
  const Icon = iconOption?.Icon;

  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-full border px-2 py-0.5 text-sm font-medium">
      {Icon ? (
        <>
          <Icon className="h-3 w-3 shrink-0" />
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {iconOption?.label}
          </span>
        </>
      ) : (
        <span className="overflow-hidden text-ellipsis whitespace-nowrap capitalize">
          {value}
        </span>
      )}
    </span>
  );
};

export { ViewComponent };
