import { z } from "zod";

import { Field } from "@/types/field";

import { isCssColor } from "./color";
import { EditComponent } from "./edit-component";
import { ViewComponent } from "./view-component";

const label = "Color";

const colorSchema = z.string().refine(isCssColor, {
  message: "Invalid color (use a CSS color like #ff8800, rgb(255 136 0), oklch(70% 0.15 40))",
});

const schema = (field: Field) => {
  if (field.required) {
    return z.preprocess(
      (value) => (value === "" ? undefined : value),
      colorSchema,
    );
  }
  return z.preprocess(
    (value) => (value === "" ? null : value),
    colorSchema.optional().nullable(),
  );
};

export { EditComponent, ViewComponent, label, schema };
