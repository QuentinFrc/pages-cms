"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";

const EditComponent = forwardRef(
  (props: any, ref: React.Ref<HTMLInputElement>) => (
    <Input {...props} className="text-base" ref={ref} type="number" />
  )
);

export { EditComponent };
