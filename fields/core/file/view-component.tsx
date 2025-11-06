"use client";

import { File } from "lucide-react";
import { useMemo } from "react";
import { getFileName } from "@/lib/utils/file";
import type { Field } from "@/types/field";

const ViewComponent = ({ value, field }: { value: string; field: Field }) => {
  const extraValuesCount = value && Array.isArray(value) ? value.length - 1 : 0;

  const filename = useMemo(
    () =>
      value
        ? Array.isArray(value)
          ? getFileName(value[0])
          : getFileName(value)
        : null,
    [value]
  );

  if (!filename) return null;

  return (
    <span className="flex items-center gap-x-1.5">
      <span className="inline-flex items-center gap-x-1.5 rounded-full border px-2 py-0.5 font-medium text-sm">
        <File className="h-3 w-3 shrink-0" />
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {filename}
        </span>
      </span>
      {extraValuesCount > 0 && (
        <span className="text-muted-foreground text-xs">
          +{extraValuesCount}
        </span>
      )}
    </span>
  );
};

export { ViewComponent };
