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
import type { EditorAdapter, EditorProps, RichTextEditorAdapter } from "./types";
import tiptapAdapter from "./adapters/tiptap";
import plateAdapter from "./adapters/plate";

const adapters: Record<EditorAdapter, RichTextEditorAdapter> = {
  tiptap: tiptapAdapter,
  plate: plateAdapter,
};

const DEFAULT_ADAPTER: EditorAdapter = "tiptap";

const resolveAdapter = (adapter?: EditorAdapter): RichTextEditorAdapter => {
  if (adapter && adapters[adapter]) return adapters[adapter];
  return adapters[DEFAULT_ADAPTER];
};

export function Editor({ adapter, ...rest }: EditorProps) {
  const { Editor: AdapterEditor } = useMemo(() => resolveAdapter(adapter), [adapter]);
  return <AdapterEditor {...rest} />;
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
  SlashImageFallback,
} from "./types";
