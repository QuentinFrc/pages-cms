"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

const EditComponent = forwardRef((props: any, ref) => {
  const { value, field, onChange } = props;
  const internalRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (field.options?.autoresize === false) return;
    if (!el) return;
    el.style.height = "auto";
    const totalBorderWidth = 2;
    el.style.height = `${el.scrollHeight + totalBorderWidth}px`;
  };

  useImperativeHandle(ref, () => internalRef.current);

  useEffect(() => {
    if (internalRef.current) adjustHeight(internalRef.current);
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight(event.target);
  };

  return (
    <Textarea
      {...props}
      className="text-base"
      maxLength={field.options?.maxlength}
      minLength={field.options?.minlength}
      onInput={handleInput}
      ref={internalRef}
      rows={field.options?.rows ?? 6}
    />
  );
});

export { EditComponent };
