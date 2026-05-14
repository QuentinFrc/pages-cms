"use client";

/**
 * Plate image element. Hand-written minimum: renders an `<img>` with
 * selection/upload state styling, mirroring TipTap's `UploadableImage`
 * attribute set (`uploading`, `uploadError`). For the canonical Plate UI
 * with caption support etc., generate via `npx shadcn add media-kit` and
 * relocate alongside this file.
 */

import { PlateElement, useSelected, type PlateElementProps } from "platejs/react";
import { cn } from "@/lib/utils";

type ImageElementNode = {
  type: "img";
  url?: string;
  alt?: string;
  title?: string;
  uploading?: boolean;
  uploadError?: string | null;
};

export function ImageElement(props: PlateElementProps) {
  const selected = useSelected();
  const element = props.element as unknown as ImageElementNode;
  const { uploading, uploadError } = element;
  const src = element.url ?? "";
  const alt = element.alt ?? "";

  return (
    <PlateElement {...props} className={cn("my-2", props.className)}>
      <figure contentEditable={false} className="relative">
        <img
          src={src}
          alt={alt}
          title={element.title || undefined}
          className={cn(
            "max-w-full rounded border border-transparent",
            selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
            uploading && "opacity-70 animate-pulse",
            uploadError && "ring-2 ring-destructive ring-offset-2 ring-offset-background",
          )}
        />
        {uploadError ? (
          <figcaption className="absolute inset-x-0 bottom-0 px-2 py-1 text-xs text-destructive-foreground bg-destructive/90">
            {uploadError}
          </figcaption>
        ) : null}
      </figure>
      {props.children}
    </PlateElement>
  );
}
