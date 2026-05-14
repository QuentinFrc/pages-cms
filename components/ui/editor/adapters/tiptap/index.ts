/**
 * TipTap rich-text adapter. Full-featured: bubble menu, slash commands,
 * tables, links, images with upload, markdown round-trip.
 */

import type { RichTextEditorAdapter } from "../../types";
import { Editor } from "./editor";

const tiptapAdapter: RichTextEditorAdapter = {
  id: "tiptap",
  label: "TipTap (ProseMirror)",
  supportedFormats: ["markdown", "html"],
  Editor,
};

export default tiptapAdapter;
export { Editor };
