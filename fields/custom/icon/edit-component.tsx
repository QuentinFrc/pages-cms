"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ICON_OPTIONS } from "./icons";

const EditComponent = forwardRef<HTMLButtonElement, any>(
  (
    { value, onChange, field, className, name, disabled, onBlur, ...props },
    ref
  ) => {
    const selectedOption = ICON_OPTIONS.find((option) => option.value === value);

    const placeholder =
      (field?.options?.placeholder as string | undefined) || "Select an icon";

    const handleValueChange = (newValue: string) => {
      if (!newValue) {
        onChange(field?.required ? undefined : null);
        return;
      }

      onChange(newValue);
    };

    const normalizedValue =
      typeof value === "string" && value.length > 0 ? value : undefined;

    return (
      <Select
        value={normalizedValue}
        onValueChange={handleValueChange}
        name={name}
        disabled={disabled}
      >
        <SelectTrigger
          ref={ref}
          className={cn("w-full", className)}
          onBlur={onBlur}
          {...props}
        >
          <SelectValue placeholder={placeholder}>
            {selectedOption ? (
              <div className="flex items-center gap-2">
                <selectedOption.Icon className="h-4 w-4" />
                <span>{selectedOption.label}</span>
              </div>
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {!field?.required && (
            <SelectItem value="">
              <span className="text-muted-foreground">None</span>
            </SelectItem>
          )}
          {ICON_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <option.Icon className="h-4 w-4" />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

EditComponent.displayName = "IconFieldEditComponent";

export { EditComponent };
