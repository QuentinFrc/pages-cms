/**
 * Plate (Slate) rich-text adapter.
 *
 * Markdown round-trip via @platejs/markdown. MDX is the same plugin with
 * `remarkMdx` added — see `./serializer.ts`.
 */

import type { RichTextEditorAdapter } from "../../types";
import { Editor } from "./editor";

const plateAdapter: RichTextEditorAdapter = {
  id: "plate",
  label: "Plate (Slate)",
  supportedFormats: ["markdown", "mdx"],
  Editor,
};

export default plateAdapter;
export { Editor };
