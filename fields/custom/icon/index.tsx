import { z } from "zod";

import { Field } from "@/types/field";

import { EditComponent } from "./edit-component";
import { ICON_OPTIONS } from "./icons";
import { ViewComponent } from "./view-component";

const label = "Icon";

const schema = (field: Field) => {
  const iconValues = ICON_OPTIONS.map((option) => option.value);
  const iconEnum = z.enum(iconValues as [string, ...string[]], {
    errorMap: () => ({ message: "Please select an icon" }),
  });

  if (field.required) {
    return z.preprocess(
      (value) => (value === "" ? undefined : value),
      iconEnum
    );
  }

  return z.preprocess(
    (value) => (value === "" ? null : value),
    iconEnum.optional().nullable()
  );
};

export { EditComponent, ViewComponent, label, schema };
export { ICON_OPTIONS };
