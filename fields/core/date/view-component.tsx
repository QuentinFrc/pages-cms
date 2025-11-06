"use client";

import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useMemo } from "react";
import type { Field } from "@/types/field";

const ViewComponent = ({
  value,
  field,
}: {
  value: string | string[];
  field: Field;
}) => {
  if (!value) return null;

  const firstValue = Array.isArray(value) ? value[0] : value;
  if (firstValue == null) return null;
  const extraValuesCount = Array.isArray(value) ? value.length - 1 : 0;
  const inputFormat = field.options?.time ? "yyyy-MM-dd'T'HH:mm" : "yyyy-MM-dd";
  const outputFormat = field.options?.time
    ? "MMM d, yyyy - HH:mm"
    : "MMM d, yyyy";

  const formatDate = useMemo(
    () => (date: string) => {
      const parsedDate = parse(date, inputFormat, new Date());
      if (!isValid(parsedDate)) {
        console.warn(
          `Date for field '${field.name}' is saved in the wrong format or invalid: ${date}.`
        );
        return null;
      }
      return format(parsedDate, outputFormat);
    },
    [inputFormat, outputFormat, field.name]
  );

  return (
    <span className="flex items-center gap-x-1.5">
      <span className="inline-flex items-center gap-x-1.5 rounded-full border px-2 py-0.5 font-medium text-sm">
        <CalendarIcon className="h-3 w-3 shrink-0" />
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {formatDate(firstValue)}
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
