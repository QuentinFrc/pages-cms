"use client";

/**
 * Plate-based rich-text editor (Slate under the hood).
 *
 * v1 scope:
 * - Markdown round-trip via @platejs/markdown (serializeMd / deserializeMd).
 * - Basic blocks (paragraph, headings, blockquote, code block) and basic
 *   marks (bold, italic, underline, strikethrough, code, kbd, sub/sup).
 * - Read-only support via the `disabled` prop.
 *
 * Not yet wired (vs. the TipTap adapter):
 * - Image upload / paste-drop / picker. The image-related props on
 *   `AdapterEditorProps` are accepted but ignored. Implementing this would
 *   require introducing a Plate image plugin and a serialization-friendly
 *   way to track upload state.
 * - Tables, links, slash commands, bubble menu. These rely on additional
 *   Plate plugins and UI; they can be layered on top of this adapter.
 * - The `format: "html"` mode. Plate's serializers here target markdown only.
 */

import { useEffect, useRef } from "react";
import { Plate, PlateContent, usePlateEditor } from "platejs/react";
import { MarkdownPlugin, deserializeMd, serializeMd } from "@platejs/markdown";
import { BasicBlocksPlugin, BasicMarksPlugin } from "@platejs/basic-nodes/react";
import { cn } from "@/lib/utils";
import type { AdapterEditorProps } from "../../types";

const plugins = [BasicBlocksPlugin, BasicMarksPlugin, MarkdownPlugin];

export function Editor({
  value = "",
  onChange = () => undefined,
  disabled = false,
  className,
  editorClassName,
  // image-related props are accepted but ignored in v1
  enableImages: _enableImages,
  enableImagePasteDrop: _enableImagePasteDrop,
  onUploadImage: _onUploadImage,
  imageFallback: _imageFallback,
  maxImageBytes: _maxImageBytes,
  onRequestImage: _onRequestImage,
  onPendingUploadsChange,
  format: _format,
  ...rest
}: AdapterEditorProps) {
  const editor = usePlateEditor({
    plugins,
    value: ({ editor }) => deserializeMd(editor, value),
  });

  const lastEmittedRef = useRef(value);

  // Sync external value changes back into the editor.
  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    lastEmittedRef.current = value;
    editor.tf.setValue(deserializeMd(editor, value));
  }, [value, editor]);

  // Plate has no separate "pending uploads" concept here; report 0 once.
  useEffect(() => {
    onPendingUploadsChange?.(0);
  }, [onPendingUploadsChange]);

  return (
    <div className={cn("relative", className)} {...rest}>
      <Plate
        editor={editor}
        readOnly={disabled}
        onChange={({ editor: e }) => {
          const md = serializeMd(e);
          if (md === lastEmittedRef.current) return;
          lastEmittedRef.current = md;
          onChange(md);
        }}
      >
        <PlateContent
          className={cn(
            "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm",
            editorClassName,
          )}
        />
      </Plate>
    </div>
  );
}
