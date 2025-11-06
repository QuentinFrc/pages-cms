"use client";

import { useMemo } from "react";
import { Thumbnail } from "@/components/thumbnail";
import { useConfig } from "@/contexts/config-context";
import type { Field } from "@/types/field";

const ViewComponent = ({ value, field }: { value: string; field: Field }) => {
  const extraValuesCount = value && Array.isArray(value) ? value.length - 1 : 0;

  const path = useMemo(
    () => (value ? (Array.isArray(value) ? value[0] : value) : null),
    [value]
  );

  const { config } = useConfig();

  const mediaName = field.options?.media || config?.object.media?.[0]?.name;

  return (
    <span className="flex items-center gap-x-1.5">
      <Thumbnail className="w-8 rounded-md" name={mediaName} path={path} />
      {extraValuesCount > 0 && (
        <span className="text-muted-foreground text-xs">
          +{extraValuesCount}
        </span>
      )}
    </span>
  );
};

export { ViewComponent };
