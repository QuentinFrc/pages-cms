/**
 * Build the right `MarkdownPlugin` configuration for the requested
 * `RichTextFormat`. v1 supports plain markdown and MDX; both round-trip via
 * `@platejs/markdown`. MDX is the same plugin with `remarkMdx` added so the
 * mdast parser preserves JSX elements.
 *
 * Centralized here so the Plate adapter doesn't carry conditional plugin
 * config in its render path.
 */

import { MarkdownPlugin, remarkMdx } from "@platejs/markdown";
import type { RichTextFormat } from "../../types";

export const buildMarkdownPlugin = (format: RichTextFormat) => {
  if (format === "mdx") {
    return MarkdownPlugin.configure({
      options: {
        remarkPlugins: [remarkMdx],
      },
    });
  }
  // markdown (and the unsupported "html" fallback, which the dispatcher
  // should normalize before it reaches us).
  return MarkdownPlugin;
};
