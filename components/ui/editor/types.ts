/**
 * Shared types for the rich-text editor adapter system.
 *
 * Adapters (tiptap, plate) implement an `Editor` component that accepts these
 * props. The dispatcher in `./index.tsx` picks one at mount time based on the
 * caller's `adapter` prop, defaulting to "tiptap".
 *
 * Note: `ImageUploadContext.editor` is intentionally typed `unknown` here.
 * The tiptap adapter narrows it to a TiptapEditor internally and consumers
 * that depend on TipTap commands (currently only the rich-text field's
 * edit-component) cast it back. A future cleanup should remove that leak by
 * routing image insertion through an adapter-defined imperative API.
 */

import type { ComponentType, HTMLAttributes } from "react";
import type {
  ImagePickerContext,
  ImagePickerFileResult,
  ImagePickerHandler,
  ImagePickerResult,
  ImagePickerUrlResult,
  SlashImageFallback,
} from "./adapters/tiptap/slash-command/suggestion";

export type EditorAdapter = "tiptap" | "plate";

export type EditorFormat = "html" | "markdown";
export type ImageFallbackMode = "data-url" | "prompt-url" | "none";

export type ImageUploadContext = {
  editor: unknown;
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
  format?: EditorFormat;
  enableImages?: boolean;
  enableImagePasteDrop?: boolean;
  onUploadImage?: ImageUploadHandler;
  imageFallback?: ImageFallbackMode;
  maxImageBytes?: number;
  onRequestImage?: ImagePickerHandler;
  onPendingUploadsChange?: (count: number) => void;
  className?: string;
  editorClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "className">;

export type AdapterEditorProps = Omit<EditorProps, "adapter">;

export type RichTextEditorAdapter = {
  id: EditorAdapter;
  label: string;
  Editor: ComponentType<AdapterEditorProps>;
};

export type {
  ImagePickerContext,
  ImagePickerFileResult,
  ImagePickerHandler,
  ImagePickerResult,
  ImagePickerUrlResult,
  SlashImageFallback,
};
