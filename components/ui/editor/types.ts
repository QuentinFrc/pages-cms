/**
 * Shared types for the rich-text editor adapter system.
 *
 * Adapters (tiptap, plate) implement an `Editor` component that accepts these
 * props. The dispatcher in `./index.tsx` picks one at mount time based on the
 * caller's `adapter` prop, defaulting to "tiptap".
 *
 * The wrapper-facing surface is intentionally adapter-agnostic: adapters
 * expose an imperative `RichTextEditorHandle` via the `onReady` callback for
 * cross-adapter operations like inserting images from the media dialog.
 */

import type { ComponentType, HTMLAttributes } from "react";

export type EditorAdapter = "tiptap" | "plate";

/**
 * The serialization target for a rich-text field. Each adapter declares
 * which formats it supports via `RichTextEditorAdapter.supportedFormats`;
 * the dispatcher falls back to "markdown" if the chosen adapter can't honor
 * the requested format.
 */
export type RichTextFormat = "markdown" | "mdx" | "html";

/** @deprecated Use `RichTextFormat`. Kept for back-compat in this PR. */
export type EditorFormat = RichTextFormat;

export type ImageFallbackMode = "data-url" | "prompt-url" | "none";

/**
 * Imperative handle an adapter exposes once its underlying editor is ready.
 *
 * Surface deliberately narrow: only operations the wrapper needs across both
 * adapters. Adapter-internal operations (TipTap chains, Slate transforms)
 * stay inside the adapter.
 */
export type RichTextEditorHandle = {
  insertImages: (srcs: string[]) => void;
  focus: () => void;
  blur: () => void;
};

/**
 * Wrapper-facing image picker context. The adapter passes this to the
 * `onRequestImage` callback when the user requests an image (e.g. via slash
 * command). It is intentionally empty for now — reserved as an extension
 * point. The wrapper uses the editor handle (from `onReady`) for any
 * follow-up imperative work.
 */
export type ImagePickerContext = Record<string, never>;

export type ImagePickerUrlResult = {
  kind: "url";
  src: string;
  alt?: string;
  title?: string;
};

export type ImagePickerFileResult = {
  kind: "file";
  file: File;
  alt?: string;
  title?: string;
};

export type ImagePickerResult = ImagePickerUrlResult | ImagePickerFileResult;

export type ImagePickerHandler = (
  context: ImagePickerContext,
) => ImagePickerResult | null | Promise<ImagePickerResult | null>;

export type SlashImageFallback = "prompt-url" | "none";

export type ImageUploadContext = {
  source: "paste" | "drop" | "slash";
};

export type ImageUploadResult = {
  src: string;
  alt?: string;
  title?: string;
};

export type ImageUploadHandler = (
  file: File,
  context: ImageUploadContext,
) => ImageUploadResult | null | Promise<ImageUploadResult | null>;

export type EditorProps = {
  adapter?: EditorAdapter;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  format?: RichTextFormat;
  enableImages?: boolean;
  enableImagePasteDrop?: boolean;
  onUploadImage?: ImageUploadHandler;
  imageFallback?: ImageFallbackMode;
  maxImageBytes?: number;
  onRequestImage?: ImagePickerHandler;
  onPendingUploadsChange?: (count: number) => void;
  onReady?: (handle: RichTextEditorHandle | null) => void;
  className?: string;
  editorClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "className">;

export type AdapterEditorProps = Omit<EditorProps, "adapter">;

export type RichTextEditorAdapter = {
  id: EditorAdapter;
  label: string;
  /**
   * Formats this adapter can serialize/deserialize. The dispatcher checks
   * the requested `format` against this list and falls back to "markdown"
   * (logging a console.warn) if the adapter doesn't support it.
   */
  supportedFormats: readonly RichTextFormat[];
  Editor: ComponentType<AdapterEditorProps>;
};
