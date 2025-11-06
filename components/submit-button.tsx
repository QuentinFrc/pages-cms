"use client";

import { Loader } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton({ ...props }) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} disabled={props.disabled || pending} type="submit">
      {props.children}
      {pending && <Loader className="ml-2 h-4 w-4 animate-spin" />}
    </Button>
  );
}
