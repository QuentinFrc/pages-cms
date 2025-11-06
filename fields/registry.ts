// TODO: split into separate files to improve bundling/tree-shaking?

import type { z } from "zod";
import type { Field } from "@/types/field";

const fieldTypes = new Set<string>();
const labels: Record<string, string> = {};
const schemas: Record<
  string,
  (field: Field, configObject?: Record<string, any>) => z.ZodTypeAny
> = {};
const defaultValues: Record<string, any> = {};
const readFns: Record<
  string,
  (value: any, field: Field, configObject?: Record<string, any>) => void
> = {};
const writeFns: Record<
  string,
  (value: any, field: Field, configObject?: Record<string, any>) => void
> = {};
const editComponents: Record<string, React.ComponentType<any>> = {};
const viewComponents: Record<string, React.ComponentType<any>> = {};

const importCoreFieldComponents = (require as any).context(
  "@/fields/core",
  true,
  /index\.(ts|tsx)$/
);
const importCustomFieldComponents = (require as any).context(
  "@/fields/custom",
  true,
  /index\.(ts|tsx)$/
);

[importCoreFieldComponents, importCustomFieldComponents].forEach(
  (importComponents) => {
    importComponents.keys().forEach((key: string) => {
      const fieldName = key.split("/")[1];
      const fieldModule = importComponents(key);

      fieldTypes.add(fieldName);

      if (fieldModule.label) labels[fieldName] = fieldModule.label;
      if (fieldModule.schema) schemas[fieldName] = fieldModule.schema;
      if (fieldModule.defaultValue)
        defaultValues[fieldName] = fieldModule.defaultValue;
      if (fieldModule.read) readFns[fieldName] = fieldModule.read;
      if (fieldModule.write) writeFns[fieldName] = fieldModule.write;
      if (fieldModule.EditComponent)
        editComponents[fieldName] = fieldModule.EditComponent;
      if (fieldModule.ViewComponent)
        viewComponents[fieldName] = fieldModule.ViewComponent;
    });
  }
);

export {
  labels,
  schemas,
  readFns,
  writeFns,
  defaultValues,
  editComponents,
  viewComponents,
  fieldTypes,
};
