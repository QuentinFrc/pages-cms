/**
 * Public types re-exported for `@pagescms/config`.
 *
 * These types are the source of truth for users authoring a `.pages.config.ts`
 * in their repo. They are derived from the Zod `ConfigSchema` (single source
 * of truth) plus the `Field` type used internally by the CMS.
 */

import type {
  Config,
  Settings,
  MediaConfig,
  NamedMedia,
  ContentLeaf,
  ContentGroup,
  ContentEntry,
  Action,
  CommitTemplates,
  CommitIdentity,
} from "@/lib/config-schema";
import type { Field } from "@/types/field";
import type { CoreFieldType } from "@/fields/registry";

type FieldType = CoreFieldType | "object" | "block" | (string & {});

type Pattern = string | { regex: string; message?: string };

type ListConfig =
  | boolean
  | {
      min?: number;
      max?: number;
      collapsible?:
        | boolean
        | { collapsed?: boolean; summary?: string };
    };

type ObjectField = Field & { type?: "object"; fields: Field[] };
type BlockField = Field & { type: "block"; blocks: Field[]; blockKey?: string };

type ContentCollection = Extract<ContentLeaf, { type: "collection" }>;
type ContentFile = Extract<ContentLeaf, { type: "file" }>;

type MediaCategory =
  | "image"
  | "document"
  | "video"
  | "audio"
  | "compressed"
  | "code"
  | "font"
  | "spreadsheet";

type ContentFormat =
  | "yaml-frontmatter"
  | "json-frontmatter"
  | "toml-frontmatter"
  | "yaml"
  | "json"
  | "toml"
  | "datagrid"
  | "code"
  | "raw";

export type {
  Config,
  Settings,
  MediaConfig,
  NamedMedia,
  ContentLeaf,
  ContentGroup,
  ContentEntry,
  ContentCollection,
  ContentFile,
  Action,
  CommitTemplates,
  CommitIdentity,
  Field,
  ObjectField,
  BlockField,
  FieldType,
  Pattern,
  ListConfig,
  MediaCategory,
  ContentFormat,
};
