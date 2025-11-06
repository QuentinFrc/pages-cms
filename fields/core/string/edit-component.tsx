"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";

const EditComponent = forwardRef(
  (props: any, ref: React.Ref<HTMLTextAreaElement>) => (
    <Input {...props} className="text-base" ref={ref} />
  )
);

export { EditComponent };
