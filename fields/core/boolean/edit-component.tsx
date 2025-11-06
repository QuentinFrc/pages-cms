"use client";

import { forwardRef } from "react";
import { Switch } from "@/components/ui/switch";

const EditComponent = forwardRef(
  (props: any, ref: React.Ref<HTMLInputElement>) => (
    <div>
      <Switch
        {...props}
        checked={props.value}
        onCheckedChange={props.onChange}
        ref={ref}
      />
    </div>
  )
);

export { EditComponent };
