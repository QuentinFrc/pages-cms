/**
 * Rich-text editor dispatcher.
 *
 * Callers import `Editor` from this module without knowing which underlying
 * editor backend they get. The `adapter` prop ("tiptap" | "plate") picks the
 * implementation at mount time, defaulting to "tiptap".
 *
 * Adapter implementations live in `./adapters/<id>/` and must export a
 * default `RichTextEditorAdapter` from their `index.ts`.
 */

"use client";

import { useMemo } from "react";
import type {
  EditorAdapter,
  EditorProps,
  RichTextEditorAdapter,
  RichTextFormat,
} from "./types";
import tiptapAdapter from "./adapters/tiptap";
import plateAdapter from "./adapters/plate";

const adapters: Record<EditorAdapter, RichTextEditorAdapter> = {
  tiptap: tiptapAdapter,
  plate: plateAdapter,
};

const DEFAULT_ADAPTER: EditorAdapter = "tiptap";
const DEFAULT_FORMAT: RichTextFormat = "markdown";

const resolveAdapter = (adapter?: EditorAdapter): RichTextEditorAdapter => {
  if (adapter && adapters[adapter]) return adapters[adapter];
  return adapters[DEFAULT_ADAPTER];
};

const resolveFormat = (
  resolved: RichTextEditorAdapter,
  requested: RichTextFormat | undefined,
): RichTextFormat => {
  const target = requested ?? DEFAULT_FORMAT;
  if (resolved.supportedFormats.includes(target)) return target;
  if (typeof console !== "undefined") {
    console.warn(
      `[rich-text] Adapter "${resolved.id}" does not support format "${target}". Falling back to "${DEFAULT_FORMAT}".`,
    );
  }
  return DEFAULT_FORMAT;
};

export function Editor({ adapter, format, ...rest }: EditorProps) {
  const resolvedAdapter = useMemo(() => resolveAdapter(adapter), [adapter]);
  const resolvedFormat = useMemo(
    () => resolveFormat(resolvedAdapter, format),
    [resolvedAdapter, format],
  );
  const AdapterEditor = resolvedAdapter.Editor;
  return <AdapterEditor format={resolvedFormat} {...rest} />;
}

export const richTextEditorAdapters = adapters;

export type {
  EditorAdapter,
  EditorFormat,
  EditorProps,
  ImageFallbackMode,
  ImagePickerContext,
  ImagePickerFileResult,
  ImagePickerHandler,
  ImagePickerResult,
  ImagePickerUrlResult,
  ImageUploadContext,
  ImageUploadHandler,
  ImageUploadResult,
  RichTextEditorAdapter,
  RichTextFormat,
  RichTextEditorHandle,
  SlashImageFallback,
} from "./types";
