/**
 * Bridge between Plate's `ImagePlugin.uploadImage(dataUrl)` callback and the
 * wrapper's `File`-based `onUploadImage` handler. Plate calls the callback
 * with a base64 data URL when an image is pasted/inserted; the wrapper
 * expects a `File`. We reconstruct the `File` here.
 */

import type { ImageUploadHandler, ImageUploadResult } from "../../types";

const inferExtension = (mimeType: string): string => {
  if (!mimeType) return "png";
  const subtype = mimeType.split("/")[1] || "png";
  return subtype.split(";")[0] || "png";
};

const dataUrlToFile = async (dataUrl: string): Promise<File> => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = inferExtension(blob.type);
  return new File([blob], `image.${extension}`, { type: blob.type });
};

export type UploadBridgeOptions = {
  onUploadImage?: ImageUploadHandler;
  onPendingChange?: (delta: 1 | -1) => void;
};

/**
 * Build a callback compatible with `ImagePlugin.uploadImage`. Returns the
 * final image URL on success, or the original dataUrl on failure (Plate
 * treats the returned value as the canonical `url` on the image node).
 */
export const buildUploadImageCallback = ({
  onUploadImage,
  onPendingChange,
}: UploadBridgeOptions) => {
  return async (dataUrl: string | ArrayBuffer): Promise<string> => {
    if (!onUploadImage || typeof dataUrl !== "string") {
      return typeof dataUrl === "string" ? dataUrl : "";
    }
    onPendingChange?.(1);
    try {
      const file = await dataUrlToFile(dataUrl);
      const result = (await onUploadImage(file, { source: "paste" })) as
        | ImageUploadResult
        | null;
      if (!result?.src) return dataUrl;
      return result.src;
    } catch {
      return dataUrl;
    } finally {
      onPendingChange?.(-1);
    }
  };
};
