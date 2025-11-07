import dynamic from "next/dynamic";
import * as booleanField from "./core/boolean";
import * as codeField from "./core/code";
import * as dateField from "./core/date";
import * as fileField from "./core/file";
import * as imageField from "./core/image";
import * as numberField from "./core/number";
import * as referenceField from "./core/reference";
import * as richTextField from "./core/rich-text";
import * as selectField from "./core/select";
import * as stringField from "./core/string";
import * as textField from "./core/text";
import * as uuidField from "./core/uuid";
import type { ComponentType } from "react";
import type { z } from "zod";
import type { Field } from "@/types/field";

type SchemaFactory = (
  field: Field,
  configObject?: Record<string, any>
) => z.ZodTypeAny;

type TransformFn = (
  value: unknown,
  field: Field,
  configObject?: Record<string, any>
) => unknown;

type FieldModule = {
  label?: string;
  schema?: SchemaFactory;
  defaultValue?: unknown;
  read?: TransformFn;
  write?: TransformFn;
  EditComponent?: ComponentType<any>;
  ViewComponent?: ComponentType<any>;
};

const fieldTypesStore = new Set<string>();
const labelsStore: Record<string, string> = {};
const schemasStore: Record<string, SchemaFactory> = {};
const defaultValuesStore: Record<string, unknown> = {};
const readFnsStore: Record<string, TransformFn> = {};
const writeFnsStore: Record<string, TransformFn> = {};
const editComponentsStore: Record<string, ComponentType<any>> = {};
const viewComponentsStore: Record<string, ComponentType<any>> = {};

const hasOwnProperty = Object.prototype.hasOwnProperty;

const normalizeFieldModule = (module: unknown): FieldModule => {
  if (!module || typeof module !== "object") return {};

  const { default: defaultExport, ...namedExports } = module as Record<
    string,
    unknown
  >;

  if (
    defaultExport &&
    typeof defaultExport === "object" &&
    !Array.isArray(defaultExport)
  ) {
    return {
      ...(defaultExport as Record<string, unknown>),
      ...namedExports,
    } as FieldModule;
  }

  if (
    defaultExport &&
    typeof defaultExport === "function" &&
    !("EditComponent" in namedExports)
  ) {
    return {
      ...namedExports,
      EditComponent: defaultExport as ComponentType<any>,
    } as FieldModule;
  }

  return module as FieldModule;
};

const createDynamicComponent = (component: ComponentType<any>) =>
  dynamic(
    () =>
      Promise.resolve({
        default: component,
      }),
    { ssr: true }
  );

const registerFieldModule = (fieldName: string, fieldModule: FieldModule) => {
  const normalizedFieldName = fieldName.trim();

  if (!normalizedFieldName) return;

  fieldTypesStore.add(normalizedFieldName);

  if (typeof fieldModule.label === "string") {
    labelsStore[normalizedFieldName] = fieldModule.label;
  }

  if (typeof fieldModule.schema === "function") {
    schemasStore[normalizedFieldName] = fieldModule.schema;
  }

  if (hasOwnProperty.call(fieldModule, "defaultValue")) {
    defaultValuesStore[normalizedFieldName] = fieldModule.defaultValue;
  }

  if (typeof fieldModule.read === "function") {
    readFnsStore[normalizedFieldName] = fieldModule.read;
  }

  if (typeof fieldModule.write === "function") {
    writeFnsStore[normalizedFieldName] = fieldModule.write;
  }

  if (fieldModule.EditComponent) {
    editComponentsStore[normalizedFieldName] = createDynamicComponent(
      fieldModule.EditComponent
    );
  }

  if (fieldModule.ViewComponent) {
    viewComponentsStore[normalizedFieldName] = createDynamicComponent(
      fieldModule.ViewComponent
    );
  }
};

let initialized = false;

const coreFieldModules: Record<string, FieldModule> = {
  boolean: booleanField,
  code: codeField,
  date: dateField,
  file: fileField,
  image: imageField,
  number: numberField,
  reference: referenceField,
  "rich-text": richTextField,
  select: selectField,
  string: stringField,
  text: textField,
  uuid: uuidField,
};

const customFieldModules: Record<string, FieldModule> = {};

const initializeRegistry = () => {
  if (initialized) return;

  const moduleGroups: Array<Record<string, FieldModule>> = [
    coreFieldModules,
    customFieldModules,
  ];

  moduleGroups.forEach((modules) => {
    Object.entries(modules).forEach(([fieldName, module]) => {
      const normalizedModule = normalizeFieldModule(module);
      registerFieldModule(fieldName, normalizedModule);
    });
  });

  initialized = true;
};

const ensureFieldRegistry = () => {
  if (!initialized) initializeRegistry();
};

const createLazyAccessor = <T extends object>(store: T): T =>
  new Proxy(store, {
    get(target, prop, receiver) {
      ensureFieldRegistry();
      return Reflect.get(target, prop, receiver);
    },
    has(target, prop) {
      ensureFieldRegistry();
      return Reflect.has(target, prop);
    },
    ownKeys(target) {
      ensureFieldRegistry();
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(target, prop) {
      ensureFieldRegistry();
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
  });

const createLazySetAccessor = <T>(store: Set<T>): Set<T> =>
  new Proxy(store, {
    get(target, prop, receiver) {
      ensureFieldRegistry();
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return (...args: any[]) =>
          Reflect.apply(value, target, args as [any, ...any[]]);
      }
      return value;
    },
  });

const labels = createLazyAccessor(labelsStore);
const schemas = createLazyAccessor(schemasStore);
const readFns = createLazyAccessor(readFnsStore);
const writeFns = createLazyAccessor(writeFnsStore);
const defaultValues = createLazyAccessor(defaultValuesStore);
const editComponents = createLazyAccessor(editComponentsStore);
const viewComponents = createLazyAccessor(viewComponentsStore);
const fieldTypes = createLazySetAccessor(fieldTypesStore);

export {
  labels,
  schemas,
  readFns,
  writeFns,
  defaultValues,
  editComponents,
  viewComponents,
  fieldTypes,
  ensureFieldRegistry,
};

export type { FieldModule, SchemaFactory, TransformFn };
