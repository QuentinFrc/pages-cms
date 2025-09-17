"use client";

import { forwardRef } from "react";
import type { ChangeEvent, FocusEvent } from "react";
import slugify from "slugify";

import { Input } from "@/components/ui/input";

const slugifyValue = (input: string) =>
  slugify(input, { lower: true, strict: true, trim: true });

const EditComponent = forwardRef<HTMLInputElement, any>(({ onChange, onBlur, value, ...rest }, ref) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const slugValue = slugifyValue(event.target.value);
    onChange?.(slugValue);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const slugValue = slugifyValue(event.target.value);

    if (onChange) {
      onChange(slugValue);
    }

    if (onBlur) {
      event.target.value = slugValue;
      onBlur(event);
    }
  };

  return (
    <Input
      {...rest}
      ref={ref}
      value={value ?? ""}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});

EditComponent.displayName = "SlugEditComponent";

export { EditComponent };
