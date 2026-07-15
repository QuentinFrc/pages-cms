"use client";

import { forwardRef, useMemo } from "react";

import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

import { iconNames } from "lucide-react/dynamic";

import { formatIconLabel } from "./icons";

type IconOption = {
  value: string;
  label: string;
};

const OPTIONS: IconOption[] = iconNames.map((name) => ({
  value: name,
  label: formatIconLabel(name),
}));

const EditComponent = forwardRef<HTMLInputElement, any>(
  ({ value, onChange, field, className, disabled }, ref) => {
    const isReadonly = Boolean(field?.readonly) || Boolean(disabled);

    const selectedOption = useMemo(() => {
      if (typeof value !== "string" || value.length === 0) return null;
      return (
        OPTIONS.find((option) => option.value === value) ?? {
          value,
          label: formatIconLabel(value),
        }
      );
    }, [value]);

    const placeholder =
      (field?.options?.placeholder as string | undefined) || "Search icons…";

    const handleValueChange = (nextValue: IconOption | null) => {
      if (isReadonly) return;
      if (!nextValue) {
        onChange(field?.required ? undefined : null);
        return;
      }
      onChange(nextValue.value);
    };

    return (
      <Combobox
        items={OPTIONS}
        value={selectedOption as any}
        onValueChange={handleValueChange as any}
        readOnly={isReadonly}
        isItemEqualToValue={(item, selected) => item?.value === selected?.value}
        autoHighlight
      >
        <ComboboxInput
          ref={ref}
          placeholder={placeholder}
          className={cn(className)}
          showTrigger={!isReadonly}
          readOnly={isReadonly}
        />
        <ComboboxContent>
          <ComboboxEmpty>No icons found.</ComboboxEmpty>
          <ComboboxList>
            {(option: IconOption) => (
              <ComboboxItem key={option.value} value={option}>
                <span>{option.label}</span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
);

EditComponent.displayName = "IconFieldEditComponent";

export { EditComponent };
