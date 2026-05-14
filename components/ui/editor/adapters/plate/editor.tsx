"use client";

/**
 * Plate-based rich-text editor (Slate under the hood).
 *
 * Plugins wired:
 * - Basic blocks (paragraph, headings, blockquote, code block) and basic
 *   marks (bold, italic, underline, strikethrough, code, kbd, sub/sup).
 * - Links (paste autodetect + markdown autolink).
 * - Lists (bulleted, numbered, task) with markdown shortcuts.
 * - Tables with cell/row plugins registered.
 * - Markdown round-trip via @platejs/markdown.
 *
 * Not yet wired — these are *UI* gaps, not capability gaps. The underlying
 * Plate plugins exist; we just haven't shipped the components that drive
 * them:
 * - Slash command menu: SlashInputPlugin needs a `SlashInputElement` UI
 *   component to render the popover. Add via the Plate UI generator
 *   (`npx shadcn add slash-kit`) or hand-write.
 * - Image upload / media picker. The current rich-text wrapper expects the
 *   adapter to expose an imperative `editor` handle to insert images from
 *   the MediaDialog; Plate's ImagePlugin + `uploadImage` config can replace
 *   that path once we generalize the wrapper's image hooks.
 * - Bubble / floating toolbar. Plate ships a FloatingToolbar UI but it
 *   needs to be installed as a generated component.
 * - The `format: "html"` mode. Plate's serializers here target markdown.
 */

import { useEffect, useMemo, useRef } from "react";
import { Plate, PlateContent, usePlateEditor } from "platejs/react";
import { deserializeMd, serializeMd } from "@platejs/markdown";
import { BasicBlocksPlugin, BasicMarksPlugin } from "@platejs/basic-nodes/react";
import { LinkPlugin } from "@platejs/link/react";
import {
  BulletedListPlugin,
  ListItemContentPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
  TaskListPlugin,
} from "@platejs/list-classic/react";
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from "@platejs/table/react";
import { ImagePlugin } from "@platejs/media/react";
import { insertImage } from "@platejs/media";
import { cn } from "@/lib/utils";
import type {
  AdapterEditorProps,
  ImageUploadHandler,
  RichTextEditorHandle,
  RichTextFormat,
} from "../../types";
import { buildMarkdownPlugin } from "./serializer";
import { ImageElement } from "./image-element";
import { buildUploadImageCallback } from "./upload-bridge";

type BuildPluginsOptions = {
  format: RichTextFormat;
  onUploadImage?: ImageUploadHandler;
  onPendingChange: (delta: 1 | -1) => void;
};

const buildPlugins = ({ format, onUploadImage, onPendingChange }: BuildPluginsOptions) => [
  BasicBlocksPlugin,
  BasicMarksPlugin,
  LinkPlugin,
  ListPlugin,
  BulletedListPlugin,
  NumberedListPlugin,
  TaskListPlugin,
  ListItemPlugin,
  ListItemContentPlugin,
  TablePlugin,
  TableRowPlugin,
  TableCellPlugin,
  TableCellHeaderPlugin,
  ImagePlugin.withComponent(ImageElement).configure({
    options: {
      uploadImage: buildUploadImageCallback({ onUploadImage, onPendingChange }),
    },
  }),
  buildMarkdownPlugin(format),
];

export function Editor({
  value = "",
  onChange = () => undefined,
  disabled = false,
  className,
  editorClassName,
  enableImages: _enableImages,
  enableImagePasteDrop: _enableImagePasteDrop,
  onUploadImage,
  imageFallback: _imageFallback,
  maxImageBytes: _maxImageBytes,
  onRequestImage: _onRequestImage,
  onPendingUploadsChange,
  onReady,
  format = "markdown",
  ...rest
}: AdapterEditorProps) {
  const pendingUploadsRef = useRef(0);
  const onPendingChange = (delta: 1 | -1) => {
    pendingUploadsRef.current = Math.max(0, pendingUploadsRef.current + delta);
    onPendingUploadsChange?.(pendingUploadsRef.current);
  };

  const plugins = useMemo(
    () => buildPlugins({ format, onUploadImage, onPendingChange }),
    // onUploadImage and onPendingChange come from props/refs; rebuilding on
    // every render would tear down the editor. Only refresh when format flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [format],
  );
  const editor = usePlateEditor({
    plugins,
    value: ({ editor }) => deserializeMd(editor, value),
  });

  const lastEmittedRef = useRef(value);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  // Sync external value changes back into the editor.
  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    lastEmittedRef.current = value;
    editor.tf.setValue(deserializeMd(editor, value));
  }, [value, editor]);

  // Surface an adapter handle to the wrapper.
  useEffect(() => {
    if (!editor) return;
    const handle: RichTextEditorHandle = {
      insertImages: (srcs) => {
        if (!srcs.length) return;
        editor.tf.focus();
        for (const src of srcs) {
          insertImage(editor, src);
        }
      },
      focus: () => {
        editor.tf.focus();
      },
      blur: () => {
        editor.tf.blur();
      },
    };
    onReadyRef.current?.(handle);
    return () => {
      onReadyRef.current?.(null);
    };
  }, [editor]);

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
