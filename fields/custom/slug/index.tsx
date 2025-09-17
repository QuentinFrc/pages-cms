import { z } from "zod";
import slugify from "slugify";

import { Field } from "@/types/field";

import { EditComponent } from "./edit-component";
import { ViewComponent } from "./view-component";

const label = "Slug";

const defaultSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const defaultErrorMessage = "Slug may only include lowercase letters, numbers, and hyphens.";

const schema = (field: Field) => {
  const regex = field.pattern
    ? typeof field.pattern === "string"
      ? new RegExp(field.pattern)
      : new RegExp(field.pattern.regex)
    : defaultSlugRegex;

  const message =
    typeof field.pattern === "object" && field.pattern.message
      ? field.pattern.message
      : defaultErrorMessage;

  if (field.required) {
    return z.string().min(1, "This field is required").regex(regex, message);
  }

  const slugSchema = z.string().regex(regex, message);
  return z.union([slugSchema, z.literal("")]);
};

const write = (value: any) => {
  if (typeof value !== "string") {
    return value;
  }

  return slugify(value, { lower: true, strict: true, trim: true });
};

const read = (value: any) => {
  if (typeof value !== "string") {
    return value;
  }

  return slugify(value, { lower: true, strict: true, trim: true });
};

const defaultValue = "";

export { label, schema, EditComponent, ViewComponent, write, read, defaultValue };
