import { z } from "zod";
import type { Field } from "@/types/field";
import { EditComponent } from "./edit-component";
import { ViewComponent } from "./view-component";

const schema = (field: Field) => {
  const zodSchema = z.coerce.boolean();

  return zodSchema;
};

const defaultValue = false;
const label = "Boolean";

export { label, schema, defaultValue, EditComponent, ViewComponent };
