import { z } from "zod";

import { Field } from "@/types/field";

import { isHexColor } from "./color";
import { EditComponent } from "./edit-component";
import { ViewComponent } from "./view-component";

const label = "Color";

const colorSchema = z.string().refine(isHexColor, {
  message: "Invalid color (use hex like #ff8800)",
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
