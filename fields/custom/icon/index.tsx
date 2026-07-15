import { z } from "zod";

import { Field } from "@/types/field";

import { EditComponent } from "./edit-component";
import { isIconName } from "./icons";
import { ViewComponent } from "./view-component";

const label = "Icon";

const iconSchema = z.string().refine(isIconName, {
  message: "Invalid icon name",
});

const schema = (field: Field) => {
  if (field.required) {
    return z.preprocess(
      (value) => (value === "" ? undefined : value),
      iconSchema,
    );
  }
  return z.preprocess(
    (value) => (value === "" ? null : value),
    iconSchema.optional().nullable(),
  );
};

export { EditComponent, ViewComponent, label, schema };
