"use client";

import { forwardRef, useMemo } from "react";
import { X } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

import { isHexColor, toPickerHex } from "./color";

const CHECKERBOARD_BG =
  "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)";

const EditComponent = forwardRef<HTMLInputElement, any>(
  ({ value, onChange, field, disabled }, ref) => {
    const isReadonly = Boolean(field?.readonly) || Boolean(disabled);
    const placeholder =
      (field?.options?.placeholder as string | undefined) || "#000000";

    const swatchColor = useMemo(
      () => (isHexColor(value) ? value : "transparent"),
      [value],
    );

    const swatchStyle =
      swatchColor === "transparent"
        ? {
            backgroundImage: CHECKERBOARD_BG,
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
          }
        : { backgroundColor: swatchColor };

    return (
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Open color picker"
                disabled={isReadonly}
                className="size-5 rounded border border-input shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
                style={swatchStyle}
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <input
                type="color"
                value={toPickerHex(value)}
                onChange={(e) => onChange(e.target.value)}
                disabled={isReadonly}
                className="h-32 w-48 cursor-pointer border-0 bg-transparent p-0"
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
        <InputGroupInput
          ref={ref}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={isReadonly}
          spellCheck={false}
        />
        {!field?.required && value && !isReadonly && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              aria-label="Clear color"
              onClick={() => onChange(null)}
            >
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    );
  },
);

EditComponent.displayName = "ColorFieldEditComponent";

export { EditComponent };
