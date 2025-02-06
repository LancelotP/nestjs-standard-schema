import { StandardSchemaV1 } from "@standard-schema/spec";

const standardSchemaDef = Symbol("standardSchemaDef");

export function createStandardSchemaDTO<T extends StandardSchemaV1>(schema: T) {
  // biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
  class StandardSchemaDTOImpl {
    public static readonly [standardSchemaDef]: T = schema;
  }

  // Used to help with type inference when using the DTO on the public API
  return StandardSchemaDTOImpl as unknown as {
    new (): StandardSchemaV1.InferOutput<T>;
  };
}

type StandardSchemaDTO<T extends StandardSchemaV1> = {
  [standardSchemaDef]: T;
};

export function isStandardSchemaDTO(
  value: unknown,
): value is StandardSchemaDTO<StandardSchemaV1> {
  return !!value && typeof value === "function" && standardSchemaDef in value;
}

export function getStandardSchemaDTO<T extends StandardSchemaV1>(
  value: StandardSchemaDTO<T>,
): T {
  return value[standardSchemaDef] as T;
}
