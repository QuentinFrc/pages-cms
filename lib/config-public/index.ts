/**
 * Public surface for `.pages.config.ts` files. This module is what the
 * server's TS-config evaluator resolves `@pagescms/config` to inside the
 * sandbox. Users will install a matching npm package as a devDependency for
 * editor autocomplete; the runtime side runs here, on the Pages CMS server.
 *
 * Every export must be a pure identity function or a plain constant — no I/O,
 * no closures over mutable state — so it is safe to evaluate user code that
 * imports from here in a `vm` context.
 */

import { extensionCategories } from "@/lib/utils/file";
import type {
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
} from "./types";

const defineConfig = (config: Config): Config => config;

const defineField = <T extends Field>(field: T): T => field;
const defineCollection = <T extends ContentLeaf>(entry: T & { type: "collection" }): T => entry;
const defineFile = <T extends ContentLeaf>(entry: T & { type: "file" }): T => entry;
const defineGroup = <T extends ContentGroup>(group: T): T => group;
const defineComponent = <T extends Field>(component: T): T => component;
const defineAction = <T extends Action>(action: T): T => action;

const categories: readonly MediaCategory[] = [
  "image",
  "document",
  "video",
  "audio",
  "compressed",
  "code",
  "font",
  "spreadsheet",
] as const;

const formats: readonly ContentFormat[] = [
  "yaml-frontmatter",
  "json-frontmatter",
  "toml-frontmatter",
  "yaml",
  "json",
  "toml",
  "datagrid",
  "code",
  "raw",
] as const;

const commitIdentities: readonly CommitIdentity[] = ["app", "user"] as const;

export {
  defineConfig,
  defineField,
  defineCollection,
  defineFile,
  defineGroup,
  defineComponent,
  defineAction,
  categories,
  formats,
  commitIdentities,
  extensionCategories,
};

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
