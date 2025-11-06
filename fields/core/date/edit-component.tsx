"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";

const EditComponent = forwardRef(
  (props: any, ref: React.Ref<HTMLInputElement>) => {
    const { field, value, onChange } = props;

    return (
      <Input
        className="w-auto text-base"
        max={field?.options?.max ?? undefined}
        min={field?.options?.min ?? undefined}
        onChange={onChange}
        ref={ref}
        step={field?.options?.step ?? undefined}
        type={field?.options?.time ? "datetime-local" : "date"}
        value={value}
      />
    );
  }
);

export { EditComponent };
