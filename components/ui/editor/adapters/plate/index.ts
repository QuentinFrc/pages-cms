/**
 * Plate (Slate) rich-text adapter.
 *
 * Minimal v1: basic blocks/marks with markdown round-trip. See `./editor.tsx`
 * for the list of features not yet wired (images, tables, slash commands).
 */

import type { RichTextEditorAdapter } from "../../types";
import { Editor } from "./editor";

const plateAdapter: RichTextEditorAdapter = {
  id: "plate",
  label: "Plate (Slate)",
  Editor,
};

export default plateAdapter;
export { Editor };
